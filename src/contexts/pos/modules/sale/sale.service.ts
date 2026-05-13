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
import { paginate } from '@/common/utilities/paginator';
import { EInvoiceService } from '../e-invoice/e-invoice.service';
import { DInvoiceService } from '../d-invoice/d-invoice.service';
import { AccountingJournalService } from '../../../finances/modules/accounting/accounting-journal.service';
import { SaleItemService } from '../sale-item/sale-item.service';
import { WarehouseService } from '@/contexts/inventory/modules/warehouse/warehouse.service';

const { sales, loyaltyScore } = posQueries;

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

    const saleId = rows[0].sale_id as string;

    if (data.is_completed) {
      await this.linkSaleToActiveSession(
        this.db,
        data.branch_id,
        saleId,
        data.sale_date,
        data.cash_register_id ?? null,
      );
    }

    return saleId;
  }

  async createFullSale(data: FullSaleDto) {
    const { items, payments } = data;

    const hasPointsPayment = (payments ?? []).some((p) => p.is_points_redemption);
    if (hasPointsPayment && !data.tenant_customer_id) {
      throw new BadRequestException(
        'Se requiere asociar un cliente para realizar pagos con puntos de fidelidad.',
      );
    }

    const txn = await this.db.transaction();
    try {

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

        if (data.is_completed) {
          await this.linkSaleToActiveSession(
            txn,
            data.branch_id,
            saleId,
            new Date(data.sale_date),
            data.cash_register_id ?? null,
          );
        }

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

        // Decrement stock from the branch's "sales floor" warehouse.
        // Composite items are exploded to their leaf components by
        // WarehouseService.consumeStockForSale.
        const wh = await txn.query(
          `SELECT warehouse_id FROM inventory_schema.warehouse
           WHERE branch_id = $1 AND is_branch = true LIMIT 1`,
          [data.branch_id],
        );
        if (!wh.rows[0]) {
          throw new BadRequestException(
            'Branch sin warehouse de piso de venta (is_branch=true)',
          );
        }
        await this.warehouseService.consumeStockForSale(
          data.tenant_id,
          wh.rows[0].warehouse_id,
          items.map((it) => ({
            product_variant_id: it.product_variant_id,
            quantity: Number(it.quantity),
          })),
          txn,
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

        // Compute points_accumulated from the active loyalty program inside the txn
        let pointsAccumulated = 0;
        if (data.tenant_customer_id) {
          const { rows: lpRows } = await txn.query(
            loyaltyScore.getActiveProgramForTenant,
            [data.tenant_id],
          );
          const lp = lpRows[0];
          if (lp && data.total_amount >= Number(lp.minimum_purchase_for_points)) {
            pointsAccumulated = Math.floor(
              data.total_amount * Number(lp.points_earned_per_currency_unit),
            );
          }
        }

        await this.dInvoiceService.createDInvoice(
          {
            tenant_customer_id: data.tenant_customer_id ?? null,
            currency_id: data.currency_id,
            subtotal_amount: data.subtotal_amount,
            tax_amount: data.tax_amount,
            total_amount: data.total_amount,
            due_date: data.due_date ? new Date(data.due_date) : new Date(),
            cash_register_session_id: data.cash_register_session_id ?? null,
            points_accumulated: pointsAccumulated,
            ad_message: data.ad_message ?? null,
            amount_paid: data.amount_paid ?? 0,
            change_amount: data.change_amount ?? 0,
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

      // Accumulate loyalty points — non-blocking, must not fail the sale
      if (data.tenant_customer_id) {
        try {
          const { rows: programRows } = await this.db.query(
            loyaltyScore.getActiveProgramForTenant,
            [data.tenant_id],
          );
          const program = programRows[0];
          if (program && data.total_amount >= Number(program.minimum_purchase_for_points)) {
            const pointsEarned = Math.floor(
              data.total_amount * Number(program.points_earned_per_currency_unit),
            );
            if (pointsEarned > 0) {
              await this.db.query(loyaltyScore.upsertEarned, [
                data.tenant_id,
                data.tenant_customer_id,
                pointsEarned,
              ]);
            }
          }
          // Deduct redeemed points from any points-redemption payment rows
          const redeemedPoints = (data.payments ?? []).reduce(
            (sum, p) => sum + (p.is_points_redemption ? (p.points_redeemed ?? 0) : 0),
            0,
          );
          if (redeemedPoints > 0) {
            await this.db.query(loyaltyScore.deductRedeemed, [
              data.tenant_id,
              data.tenant_customer_id,
              redeemedPoints,
            ]);
          }
        } catch (loyaltyError) {
          this.logger.error(
            `Loyalty points update failed for sale ${saleId}: ${(loyaltyError as Error).message}`,
          );
        }
      }

      if (data.has_electronic_invoice) {
        try {
          await this.eInvoiceService.createEInvoiceForSale(saleId);
        } catch (eInvoiceError) {
          this.logger.error(
            `E-invoice generation failed for sale ${saleId}: ${(eInvoiceError as Error).message}`,
          );
          return {
            saleId,
            eInvoiceWarning: 'No se pudo generar la factura electrónica',
          };
        }
      }

      return { saleId };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(
        `Error creating full sale: ${(error as Error).message}`,
      );
      throw new SaleCreationError();
    }
  }

  async getAllSalesByBranch(branch_id: string): Promise<SaleFromDb[]> {
    const result = await this.db.query(sales.getSalesByBranch, [branch_id]);
    return result.rows;
  }

  async getAllSalesByTenant(tenantId: string, limit = 100, offset = 0) {
    return paginate({
      dbClient: this.db,
      table: `
        (SELECT s.sale_id, s.sale_date, s.total_amount, s.subtotal_amount, s.tax_amount,
          s.is_completed, s.has_electronic_invoice, s.is_refunded, s.tenant_customer_id,
          s.created_at, b.branch_id, b.branch_name, c.currency_code, c.symbol, b.tenant_id,
          (SELECT rt.return_transaction_id FROM pos_schema.return_transaction rt
            LEFT JOIN pos_schema.digital_sale_invoice dsi
              ON dsi.digital_sale_invoice_id = rt.digital_sale_invoice_id
            LEFT JOIN pos_schema.electronic_sale_invoice esi
              ON esi.electronic_sale_invoice_id = rt.electronic_sale_invoice_id
            WHERE dsi.sale_id = s.sale_id OR esi.sale_id = s.sale_id LIMIT 1
          ) AS return_transaction_id
        FROM pos_schema.sale s
        INNER JOIN general_schema.branch b USING(branch_id)
        INNER JOIN general_schema.currency c USING(currency_id)
        ) AS paginated_sales
      `,
      selectColumns: [
        'sale_id', 'sale_date', 'total_amount', 'subtotal_amount', 'tax_amount',
        'is_completed', 'has_electronic_invoice', 'is_refunded', 'branch_id',
        'branch_name', 'currency_code', 'symbol', 'tenant_customer_id',
        'created_at', 'return_transaction_id',
      ],
      pkFields: ['sale_id'],
      where: { tenant_id: tenantId },
      options: { limit, offset, sortBy: 'created_at', order: 'DESC' },
    });
  }

  async getAllConditions(): Promise<Condition[]> {
    const { rows } = await this.db.query(sales.getConditions);

    return rows;
  }

  private async linkSaleToActiveSession(
    executor: {
      query: (
        sql: string,
        params?: unknown[],
      ) => Promise<{ rowCount?: number | null }>;
    },
    branchId: string,
    saleId: string,
    transactionTime?: Date | null,
    cashRegisterId?: string | null,
  ): Promise<void> {
    const result = await executor.query(sales.linkSaleToActiveSession, [
      branchId,
      saleId,
      transactionTime ?? null,
      cashRegisterId ?? null,
    ]);

    if (!result.rowCount || result.rowCount < 1) {
      this.logger.warn(
        `Sale ${saleId} was completed without an active cash register session in branch ${branchId}${cashRegisterId ? ` for cash register ${cashRegisterId}` : ''}`,
      );
    }
  }
}
