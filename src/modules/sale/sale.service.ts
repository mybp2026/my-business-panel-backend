import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { FullSaleDto, NewSingleSaleDto } from './dto/sales.dto';
import { queries } from '@/queries';

import { CustomerPaymentService } from '../customer_payment/customer_payment.service';
import { SaleItemService } from '../sale-item/sale-item.service';
import { Condition, SaleFromDb } from './interface/sale.interface';
import { WarehouseService } from '../warehouse/warehouse.service';
import { SaleCreationError } from '@/common/errors/sale_creation.error';
import { EInvoiceService } from '../e-invoice/e-invoice.service';
import { DInvoiceService } from '../d-invoice/d-invoice.service';
import { AccountingJournalService } from '../accounting/accounting-journal.service';

@Injectable()
export class SaleService {
  private readonly logger = new Logger(SaleService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly saleItemService: SaleItemService,
    private readonly customerPaymentService: CustomerPaymentService,
    private readonly warehouseService: WarehouseService,
    private readonly eInvoiceService: EInvoiceService,
    private readonly dInvoiceService: DInvoiceService,
    private readonly journalService: AccountingJournalService,
  ) {}

  async createSale(data: NewSingleSaleDto) {
    const params = [
        data.branch_id,
        data.tenant_customer_id,
        data.sale_condition,
        data.sale_date,
        data.currency_id,
        data.subtotal_amount,
        data.tax_amount,
        data.total_amount,
        data.is_completed,
        data.has_electronic_invoice,
      ],
      { rows } = await this.db.query(queries.sales.createSale, params);

    return rows[0].sale_id;
  }

  async createFullSale(data: FullSaleDto) {
    const txn = await this.db.transaction();
    try {
      const { items, payments } = data;

      let saleId: string;
      try {
        const { rows } = await txn.query(queries.sales.createSale, [
          data.branch_id,
          data.tenant_customer_id,
          data.sale_condition,
          new Date(data.sale_date),
          data.currency_id,
          data.subtotal_amount,
          data.tax_amount,
          data.total_amount,
          data.is_completed,
          data.has_electronic_invoice,
        ]);
        saleId = rows[0].sale_id;

        await txn.bulkInsert(
          'pos_schema.sale_item',
          [
            'sale_id',
            'tenant_id',
            'product_variant_id',
            'quantity',
            'unit_price',
            'total_price',
          ],
          items.map((item) => [
            saleId,
            item.tenant_id,
            item.product_variant_id,
            item.quantity,
            item.unit_price,
            item.total_price,
          ]),
        );

        await txn.bulkInsert(
          'pos_schema.customer_payment',
          [
            'tenant_customer_id',
            'sale_id',
            'payment_method_id',
            'is_points_redemption',
            'points_redeemed',
            'points_to_currency_rate',
            'payment_amount',
            'payment_date',
            'currency_id',
            'verified',
          ],
          payments.map((p) => [
            p.tenant_customer_id,
            saleId,
            p.payment_method_id,
            p.is_points_redemption,
            p.points_redeemed,
            p.points_to_currency_rate,
            p.payment_amount,
            p.payment_date,
            p.currency_id,
            p.verified,
          ]),
        );

        await this.dInvoiceService.createDInvoice(
          {
            tenant_customer_id: data.tenant_customer_id,
            currency_id: data.currency_id,
            subtotal_amount: data.subtotal_amount,
            tax_amount: data.tax_amount,
            total_amount: data.total_amount,
            invoiced_at: new Date(),
            updated_at: new Date(),
            sale_id: saleId,
          },
          txn,
        );

        // --- Accounting: generate journal entries ---
        try {
          // 1. Revenue entry (cash or credit)
          await this.journalService.generateSaleJournal(
            {
              tenantId: data.tenant_id,
              saleId,
              saleCondition: data.sale_condition,
              subtotalAmount: data.subtotal_amount,
              taxAmount: data.tax_amount,
              totalAmount: data.total_amount,
              entryDate: new Date(data.sale_date),
            },
            txn,
          );

          // 2. COGS entry — compute total cost from item cost data
          //    Uses unit_price from product_variant as cost proxy
          const costResult = await txn.query(
            `SELECT COALESCE(SUM(pv.unit_price * $2[idx]), 0) AS total_cost
             FROM unnest($1::uuid[]) WITH ORDINALITY AS u(variant_id, idx)
             JOIN general_schema.product_variant pv
               ON pv.product_variant_id = u.variant_id AND pv.tenant_id = $3`,
            [
              items.map((i) => i.product_variant_id),
              items.map((i) => i.quantity),
              data.tenant_id,
            ],
          );

          // Fallback: sum item quantities * variant unit_price individually
          let totalCost = 0;
          for (const item of items) {
            const res = await txn.query(
              `SELECT unit_price FROM general_schema.product_variant
               WHERE tenant_id = $1 AND product_variant_id = $2 LIMIT 1`,
              [data.tenant_id, item.product_variant_id],
            );
            if (res.rows.length > 0 && res.rows[0].unit_price != null) {
              totalCost += Number(res.rows[0].unit_price) * item.quantity;
            }
          }

          if (totalCost > 0) {
            await this.journalService.generateSaleCogsJournal(
              {
                tenantId: data.tenant_id,
                saleId,
                totalCost,
                entryDate: new Date(data.sale_date),
              },
              txn,
            );
          }
        } catch (accountingError) {
          // Log but don't fail the sale — accounting is secondary
          this.logger.error(
            `Error generating journal entries for sale ${saleId}: ${(accountingError as Error).message}`,
          );
        }

        await txn.commit();
      } catch (txnError) {
        await txn.rollback();
        throw txnError;
      }

      if (data.has_electronic_invoice) {
        try {
          await this.eInvoiceService.createEInvoiceForSale(saleId);
        } catch (eInvoiceError) {
          console.error('Error generating e-invoice for sale:', eInvoiceError);
          return { saleId, eInvoiceWarning: (eInvoiceError as Error).message };
        }
      }

      return { saleId };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Error creating full sale:', error);
      throw new SaleCreationError();
    }
  }

  async getAllSalesByBranch(branch_id: string): Promise<SaleFromDb[]> {
    const res = await this.db.query(queries.sales.getSalesByBranch, [
      branch_id,
    ]);
    return res.rows;
  }

  async getAllConditions(): Promise<Condition[]> {
    const { rows } = await this.db.query(queries.sales.getConditions);

    return rows;
  }
}
