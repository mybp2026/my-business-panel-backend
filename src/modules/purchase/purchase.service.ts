import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import Database from '@crane-technologies/database/dist/components/Database';
import { DATABASE } from '../db/db.provider';
import { purchaseQueries } from './purchase.queries';
import { WarehouseService } from '../warehouse/warehouse.service';
import { AccountingJournalService } from '../accounting/accounting-journal.service';

@Injectable()
export class PurchaseService {
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly warehouseService: WarehouseService,
    private readonly journalService: AccountingJournalService,
  ) {}

  async createPurchaseOrder(param: CreatePurchaseDto) {
    const {
      supplier_id,
      warehouse_id,
      expected_delivery_date,
      items,
      has_invoice,
      payment_condition,
    } = param;

    const result = await this.db.query(purchaseQueries.createPurchaseOrder, [
      supplier_id,
      warehouse_id,
      expected_delivery_date,
      items,
      has_invoice,
      payment_condition,
    ]);

    return result.rows[0];
  }

  async threeWayMatching(createPurchaseDto: any) {
    const { purchase_order_id, goods_receipt_id } = createPurchaseDto || {};

    if (!purchase_order_id || !goods_receipt_id) {
      throw new BadRequestException(
        'purchase_order_id y goods_receipt_id son requeridos',
      );
    }

    await this.db.query(purchaseQueries.threeWayMatching, [
      purchase_order_id,
      goods_receipt_id,
    ]);

    return { message: 'Three-way matching ejecutado' };
  }

  async registerPayment(dto: CreatePaymentDto) {
    const txn = await this.db.transaction();
    try {
      const {
        purchase_account_payable_id,
        amount_paid,
        payment_method_id,
        payment_reference,
      } = dto;

      let insertResult;
      try {
        insertResult = await txn.query(purchaseQueries.insertPayment, [
          purchase_account_payable_id,
          amount_paid,
          payment_method_id,
          payment_reference ?? null,
        ]);
      } catch (e: any) {
        console.error('Error inserting payment:', e);
        throw new BadRequestException(
          'Error al registrar el pago: ' + (e.detail || e.message),
        );
      }

      const paymentId = insertResult.rows[0]?.purchase_order_payment_id;
      if (!paymentId)
        throw new Error('No se pudo obtener purchase_order_payment_id');

      const payableResult = await txn.query(
        purchaseQueries.getUpdatedPayableById,
        [purchase_account_payable_id],
      );

      // --- Accounting: generate payment-made journal entry ---
      try {
        const paymentInfo = await txn.query(
          purchaseQueries.getPaymentAmountForJournal,
          [paymentId],
        );
        if (paymentInfo.rows.length > 0) {
          const { tenant_id, purchase_order_id } = paymentInfo.rows[0];
          await this.journalService.generatePaymentMadeJournal(
            {
              tenantId: tenant_id,
              sourceId: purchase_order_id,
              amount: Number(amount_paid),
              entryDate: new Date(),
              description: `Pago a proveedor - OC ${purchase_order_id}`,
            },
            txn,
          );
        }
      } catch (accountingError) {
        this.logger.error(
          `Error generating payment journal for payment ${paymentId}: ${(accountingError as Error).message}`,
        );
      }

      await txn.commit();

      return {
        payment_id: paymentId,
        purchase_account_payable: payableResult.rows[0] ?? null,
      };
    } catch (error) {
      await txn.rollback();
      throw error;
    }
  }

  async getAllPurchaseOrders(tenantId: string) {
    const result = await this.db.query(purchaseQueries.getAllByTenant, [
      tenantId,
    ]);
    return result.rows;
  }

  async getPurchaseOrderById(id: string) {
    const result = await this.db.query(purchaseQueries.getById, [id]);
    return result.rows[0] ?? null;
  }

  async updatePurchaseOrder(id: string, updatePurchaseDto: UpdatePurchaseDto) {
    const result = await this.db.query(purchaseQueries.updateStatus, [
      (updatePurchaseDto as any)?.purchase_order_status_id ?? null,
      id,
    ]);
    return result.rows[0] ?? null;
  }

  async updateOrderStatus(orderId: string, statusId: number, tenantId: string) {
    const currentResult = await this.db.query(
      purchaseQueries.getCurrentStatusByIdAndTenant,
      [orderId, tenantId],
    );

    if (!currentResult.rows.length) {
      throw new NotFoundException('Orden no encontrada para este tenant');
    }

    const currentStatus: number =
      currentResult.rows[0].purchase_order_status_id;

    const allowedTransitions: Record<number, number[]> = {
      1: [2],
      2: [3],
      3: [],
      4: [],
    };

    if (currentStatus === statusId) {
      return {
        purchase_order_id: orderId,
        purchase_order_status_id: currentStatus,
        message: 'La orden ya tiene ese estado',
      };
    }

    const isAllowed = (allowedTransitions[currentStatus] || []).includes(
      statusId,
    );
    if (!isAllowed) {
      throw new BadRequestException(
        `Transicion invalida: ${currentStatus} -> ${statusId}`,
      );
    }

    if (statusId === 3) {
      // Delivery: wrap status update + inventory + accounting in a transaction
      const txn = await this.db.transaction();
      try {
        const updateResult = await txn.query(
          purchaseQueries.updateOrderStatus,
          [statusId, orderId],
        );

        const itemsResult = await txn.query(
          purchaseQueries.getItemsForInventory,
          [orderId],
        );
        for (const item of itemsResult.rows) {
          await this.warehouseService.receiveStockFromPurchase(
            item.warehouse_id,
            item.product_variant_id,
            item.tenant_id,
            item.quantity_ordered,
          );
        }

        // --- Accounting: generate purchase journal entry ---
        try {
          const amountsResult = await txn.query(
            purchaseQueries.getOrderAmountsForJournal,
            [orderId],
          );
          if (amountsResult.rows.length > 0) {
            const row = amountsResult.rows[0];
            await this.journalService.generatePurchaseJournal(
              {
                tenantId: row.tenant_id,
                purchaseOrderId: orderId,
                subtotalAmount: Number(row.subtotal_amount),
                taxAmount: Number(row.tax_amount),
                totalAmount: Number(row.total_amount),
                entryDate: new Date(),
              },
              txn,
            );
          }
        } catch (accountingError) {
          this.logger.error(
            `Error generating purchase journal for order ${orderId}: ${(accountingError as Error).message}`,
          );
        }

        await txn.commit();
        return updateResult.rows[0];
      } catch (error) {
        await txn.rollback();
        throw error;
      }
    }

    // Non-delivery transitions: simple update
    const updateResult = await this.db.query(
      purchaseQueries.updateOrderStatus,
      [statusId, orderId],
    );

    return updateResult.rows[0];
  }

  async getThreeWayMatching(orderId: string) {
    const result = await this.db.query(purchaseQueries.getMatchingByOrderId, [
      orderId,
    ]);

    if (!result.rows.length) {
      return {
        purchase_order_id: orderId,
        matching_found: false,
        message: 'No existe conciliacion three-way matching para esta orden',
      };
    }

    const row = result.rows[0];
    return {
      matching_found: true,
      matching_id: row.matching_id,
      purchase_order_id: row.purchase_order_id,
      goods_receipt_id: row.goods_receipt_id,
      supplier_invoice_id: row.supplier_invoice_id,
      amounts_matched: row.amounts_matched,
      quantities_matched: row.quantities_matched,
      is_matched: row.is_matched,
      matched_at: row.matched_at,
      amount_comparison: row.amount_comparison,
      quantity_comparison: row.quantity_comparison,
    };
  }
}
