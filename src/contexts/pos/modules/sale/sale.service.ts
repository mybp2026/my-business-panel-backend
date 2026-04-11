import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DATABASE } from '../../../general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { FullSaleDto, NewSingleSaleDto } from './dto/sales.dto';
import { posQueries } from '@pos/pos.queries';

import { CustomerPaymentService } from '../../../general/modules/customer_payment/customer-payment.service';
import { Condition, SaleFromDb } from './interface/sale.interface';
import { SaleCreationError } from '@/common/errors/sale_creation.error';
import { EInvoiceService } from '../e-invoice/e-invoice.service';
import { DInvoiceService } from '../d-invoice/d-invoice.service';
import { AccountingJournalService } from '../../../finances/modules/accounting/accounting-journal.service';
import { SaleItemService } from '../sale-item/sale-item.service';
import { WarehouseService } from '@/contexts/inventory/modules/warehouse/warehouse.service';

const { sales } = posQueries;

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
        null, // seller_user_id
      ],
      { rows } = await this.db.query(sales.createSale, params);

    return rows[0].sale_id;
  }

  async createFullSale(data: FullSaleDto) {
    const txn = await this.db.transaction();
    try {
      const { items, payments } = data;

      let saleId: string;
      try {
        const { rows } = await txn.query(sales.createSale, [
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
          data.seller_user_id ?? null,
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
            'sale_price_type',
            'promotion_id',
            'original_price',
            'discount_applied',
          ],
          items.map((item) => [
            saleId,
            item.tenant_id,
            item.product_variant_id,
            item.quantity,
            item.unit_price,
            item.total_price,
            item.sale_price_type ?? 'NORMAL',
            item.promotion_id ?? null,
            item.original_price ?? item.unit_price,
            item.discount_applied ?? 0,
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

        try {
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

          let totalCost = 0;
          for (const item of items) {
            const res = await txn.query(
              `SELECT COALESCE(weighted_avg_cost, cost_price, 0) AS item_cost
               FROM general_schema.product_variant
               WHERE tenant_id = $1 AND product_variant_id = $2 LIMIT 1`,
              [data.tenant_id, item.product_variant_id],
            );
            if (res.rows.length > 0) {
              const itemCost = Number(res.rows[0].item_cost);
              // Snapshot cost_price_at_sale on the sale_item row
              await txn.query(
                `UPDATE pos_schema.sale_item
                 SET cost_price_at_sale = $1
                 WHERE sale_id = $2 AND product_variant_id = $3 AND tenant_id = $4`,
                [itemCost, saleId, item.product_variant_id, item.tenant_id],
              );
              if (itemCost > 0) {
                totalCost += itemCost * item.quantity;
              }
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
    const result = await this.db.query(sales.getSalesByBranch, [branch_id]);
    return result.rows;
  }

  async getAllConditions(): Promise<Condition[]> {
    const { rows } = await this.db.query(sales.getConditions);

    return rows;
  }
}
