import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Database from '@crane-technologies/database';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import { Warehouse } from './interfaces/warehouse.interface';
import { CreateWarehouseDto } from './dto/create_warehouse.dto';
import { UpdateWarehouseDto } from './dto/update_warehouse.dto';
import { BulkInsertInventoryDto } from './dto/bulk_insert_inventory.dto';
import { generalQueries } from '@general/general.queries';
import { ProductService } from '@/contexts/general/modules/product/product.service';
import { explodeForInventory } from '@/contexts/general/modules/product_composition/helpers/explode';
import { ProductCount } from './interfaces/product_count.interface';
import { InventoryItem } from './interfaces/inventory_item.interface';
import { InventoryTransferSummary } from './interfaces/inventory_transfer_summary.interface';
// import { InvalidTenantError } from '@/common/errors/invalid_tenant.error';
import { InventoryTransferProduct } from './interfaces/inventory_transfer_product.interface';
import { InventoryTransfer } from './interfaces/inventory_transfer.interface';
import { inventoryQueries } from '../../inventory.queries';
import { StateService } from '@/contexts/general/modules/state/state.service';

const { branch } = generalQueries;

@Injectable()
export class WarehouseService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly state: StateService,
    private readonly products: ProductService,
  ) {}

  async createWarehouse(
    createWarehouseDto: CreateWarehouseDto,
    tenant_id: string,
  ): Promise<Warehouse> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const result = await this.db.query(branch.byIdAndTenant, [
      createWarehouseDto.branch_id,
      tenant_id,
    ]);
    if (result.rowCount === 0)
      throw new NotFoundException(
        `Branch with ID ${createWarehouseDto.branch_id} not found for Tenant with ID ${tenant_id}`,
      );

    // Always create as auxiliary bodega — the sales-floor warehouse is
    // provisioned automatically by inventory_schema.fn_branch_create_warehouse
    // when a branch is inserted. We never let the API client pass is_branch.
    const { rows } = await this.db.query(inventoryQueries.create, [
      createWarehouseDto.branch_id,
      createWarehouseDto.warehouse_name,
      createWarehouseDto.warehouse_address,
      false,
    ]);

    return rows[0] ?? new NotFoundException('Warehouse could not be created');
  }

  async updateWarehouse(
    warehouse_id: string,
    tenant_id: string,
    updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(inventoryQueries.byTenantAndId, [
      warehouse_id,
      tenant_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found for Tenant with ID ${tenant_id}`,
      );

    // Pin is_branch to its current value so the type of warehouse can never
    // be toggled through this endpoint.
    const { rows } = await this.db.query(inventoryQueries.update, [
      warehouse_id,
      updateWarehouseDto.warehouse_name ?? null,
      updateWarehouseDto.warehouse_address ?? null,
      null,
    ]);
    return rows[0];
  }

  async deleteWarehouse(
    warehouse_id: string,
    tenant_id: string,
  ): Promise<{ message: string }> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(inventoryQueries.byTenantAndId, [
      warehouse_id,
      tenant_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found for Tenant with ID ${tenant_id}`,
      );

    if (warehouse.rows[0]?.is_branch) {
      throw new BadRequestException(
        'No se puede eliminar el piso de venta de una sucursal. ' +
          'Elimina la sucursal asociada para retirar este almacén.',
      );
    }

    await this.db.query(inventoryQueries.delete, [warehouse_id]);
    return { message: 'Warehouse deleted successfully' };
  }

  async listInventoryByWarehouse(
    warehouse_id: string,
    tenant_id: string,
    search?: string,
  ): Promise<InventoryItem[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(inventoryQueries.byTenantAndId, [
      warehouse_id,
      tenant_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found for Tenant with ID ${tenant_id}`,
      );

    const { rows } = await this.db.query(
      inventoryQueries.listInventoryByWarehouse,
      [warehouse_id, tenant_id, search ?? null],
    );
    return rows as InventoryItem[];
  }

  async updateInventoryItem(
    inventory_id: string,
    tenant_id: string,
    stock?: number,
    expiration_date?: string | null,
  ): Promise<InventoryItem> {
    const { rows } = await this.db.query(inventoryQueries.updateInventoryItem, [
      inventory_id,
      stock ?? null,
      expiration_date ?? null,
      tenant_id,
    ]);
    if (rows.length === 0)
      throw new NotFoundException(
        `Inventory item ${inventory_id} not found for tenant ${tenant_id}`,
      );
    return rows[0] as InventoryItem;
  }

  async deleteInventoryItem(
    inventory_id: string,
    tenant_id: string,
  ): Promise<{ message: string }> {
    await this.db.query(inventoryQueries.deleteInventoryItem, [
      inventory_id,
      tenant_id,
    ]);
    return { message: 'Inventory item deleted successfully' };
  }

  async bulkInsertInventory(
    tenant_id: string,
    dto: BulkInsertInventoryDto,
  ): Promise<{ inserted: number }> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(inventoryQueries.byTenantAndId, [
      dto.warehouse_id,
      tenant_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${dto.warehouse_id} not found for Tenant with ID ${tenant_id}`,
      );

    if (dto.items.length === 0)
      throw new BadRequestException('items must contain at least one entry');

    const payload = dto.items.map((it) => ({
      product_variant_id: it.product_variant_id,
      stock: it.stock,
      expiration_date: it.expiration_date ?? null,
    }));

    const txn = await this.db.transaction();
    let committed = false;
    try {
      const { rowCount } = await txn.query(
        inventoryQueries.bulkInsertInventory,
        [tenant_id, dto.warehouse_id, JSON.stringify(payload)],
      );

      for (const item of dto.items) {
        await txn.query(inventoryQueries.logInventoryMovement, [
          1,
          dto.warehouse_id,
          tenant_id,
          item.product_variant_id,
          item.stock,
        ]);
      }

      await txn.commit();
      committed = true;
      return { inserted: rowCount ?? 0 };
    } catch (error) {
      if (!committed) {
        try {
          await txn.rollback();
        } catch (rollbackError) {
          console.error(
            '[WarehouseService.bulkInsertInventory] Rollback failed:',
            rollbackError,
          );
        }
      }
      throw error;
    }
  }

  async addProductToWarehouse(
    warehouse_id: string,
    product_id: string,
    tenant_id: string,
    amount: number,
    expiration_date?: string,
  ) {
    if (amount <= 0)
      throw new NotFoundException('Amount must be greater than zero');

    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(inventoryQueries.byId, [
      warehouse_id,
    ]);

    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const product = await this.products.getProductById(product_id, tenant_id);
    if (!product)
      throw new NotFoundException(`Product with ID ${product_id} not found`);

    await this.db.query(inventoryQueries.insertIntoInventory, [
      tenant_id,
      warehouse_id,
      product_id,
      amount,
      expiration_date,
    ]);
    return { message: 'Product added to warehouse successfully' };
  }

  async addStockToProduct(
    warehouse_id: string,
    product_id: string,
    tenant_id: string,
    amount: number,
    costInfo?: {
      purchaseOrderId: string;
      unitCost: number;
      currencyId?: number;
      exchangeRate?: number;
    },
  ): Promise<void> {
    if (amount <= 0) {
      throw new NotFoundException('Amount must be greater than zero');
    }
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);
    }

    const warehouse = await this.db.query(inventoryQueries.byId, [
      warehouse_id,
    ]);
    if (warehouse.rowCount === 0) {
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );
    }

    const product = await this.products.getProductById(product_id, tenant_id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${product_id} not found`);
    }

    await this.db.query(inventoryQueries.addStock, [
      amount,
      warehouse_id,
      product_id,
      tenant_id,
    ]);
  }

  async removeStockFromProduct(
    warehouse_id: string,
    product_id: string,
    tenant_id: string,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) {
      throw new NotFoundException('Amount must be greater than zero');
    }
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);
    }

    await this.db.query(inventoryQueries.removeStock, [
      amount,
      warehouse_id,
      product_id,
      tenant_id,
    ]);
  }

  async getWarehousesByTenant(tenant_id: string): Promise<Warehouse[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const { rows } = await this.db.query(inventoryQueries.byTenant, [
      tenant_id,
    ]);
    return rows;
  }

  async getWarehousesByBranch(
    branch_id: string,
    tenant_id: string,
  ): Promise<Warehouse[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const result = await this.db.query(branch.byIdAndTenant, [
      branch_id,
      tenant_id,
    ]);
    if (result.rowCount === 0)
      throw new NotFoundException(
        `Branch with ID ${branch_id} not found for Tenant with ID ${tenant_id}`,
      );

    const { rows } = await this.db.query(inventoryQueries.byBranch, [
      branch_id,
      tenant_id,
    ]);
    return rows;
  }

  async countAllInWarehouse(
    warehouse_id: string,
    tenant_id: string,
  ): Promise<ProductCount[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(inventoryQueries.byId, [
      warehouse_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const { rows } = await this.db.query(inventoryQueries.countAllInWarehouse, [
      warehouse_id,
      tenant_id,
    ]);
    return rows;
  }

  async getStockByWarehouse(
    warehouse_id: string,
    tenant_id: string,
  ): Promise<ProductCount[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(inventoryQueries.byTenantAndId, [
      warehouse_id,
      tenant_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found for Tenant with ID ${tenant_id}`,
      );

    const { rows } = await this.db.query(inventoryQueries.countAllInWarehouse, [
      warehouse_id,
      tenant_id,
    ]);
    return rows;
  }

  async createDiscrepancyReport(
    tenant_id: string,
    product_id: string,
    warehouse_id: string,
    stored_quantity: number,
    physical_cuantity: number,
    discrepancy_reason: string,
  ): Promise<void> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(inventoryQueries.byId, [
      warehouse_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const product = await this.products.getProductById(product_id, tenant_id);
    if (!product)
      throw new NotFoundException(`Product with ID ${product_id} not found`);

    await this.db.query(inventoryQueries.createDiscrepancyReport, [
      tenant_id,
      product_id,
      warehouse_id,
      stored_quantity,
      physical_cuantity,
      discrepancy_reason,
    ]);
  }

  async getDiscrepancyReports(
    tenant_id: string,
    warehouse_id: string,
  ): Promise<any[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(inventoryQueries.byId, [
      warehouse_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const { rows } = await this.db.query(
      inventoryQueries.getAllDiscrepancyReports,
      [warehouse_id, tenant_id],
    );
    return rows;
  }

  async getDiscrepancyReportById(
    tenant_id: string,
    discrepancy_count_id: string,
  ) {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const { rows } = await this.db.query(
      inventoryQueries.getDiscrepancyReportById,
      [tenant_id, discrepancy_count_id],
    );
    if (rows.length === 0)
      throw new NotFoundException(
        `Discrepancy Report with ID ${discrepancy_count_id} not found`,
      );

    return rows[0];
  }

  async receiveStockFromPurchase(
    warehouse_id: string,
    product_variant_id: string,
    tenant_id: string,
    quantity: number,
    costInfo?: {
      purchaseOrderId: string;
      unitCost: number;
      currencyId?: number;
      exchangeRate?: number;
    },
  ): Promise<void> {
    // Composite parents are virtual: explode into child components and apply
    // reception per-child, dividing unit cost proportionally to the ratio.
    const meta = await this.db.query(
      `SELECT is_composite FROM general_schema.product_variant
       WHERE tenant_id = $1 AND product_variant_id = $2 LIMIT 1`,
      [tenant_id, product_variant_id],
    );
    if (meta.rows[0]?.is_composite === true) {
      const components = await this.db.query(
        generalQueries.productComposition.byParent,
        [tenant_id, product_variant_id],
      );
      for (const c of components.rows) {
        const ratio = Number(c.quantity);
        const childQty = quantity * ratio;
        const childCost = costInfo
          ? {
              ...costInfo,
              unitCost: ratio > 0 ? costInfo.unitCost / ratio : 0,
            }
          : undefined;
        await this.receiveStockFromPurchase(
          warehouse_id,
          c.child_product_variant_id,
          tenant_id,
          childQty,
          childCost,
        );
      }
      return;
    }

    // Update product cost BEFORE adding stock (weighted avg needs current stock level)
    if (costInfo && costInfo.unitCost > 0) {
      await this.db.query(inventoryQueries.updateProductCost, [
        tenant_id,
        product_variant_id,
        costInfo.purchaseOrderId,
        quantity,
        costInfo.unitCost,
        costInfo.currencyId ?? null,
        costInfo.exchangeRate ?? null,
      ]);
    }

    const updateResult = await this.db.query(inventoryQueries.addStock, [
      quantity,
      warehouse_id,
      product_variant_id,
      tenant_id,
    ]);

    if (updateResult.rowCount === 0) {
      await this.db.query(inventoryQueries.insertIntoInventory, [
        tenant_id,
        warehouse_id,
        product_variant_id,
        quantity,
        null,
      ]);
    }

    await this.db.query(inventoryQueries.logInventoryMovement, [
      1, // IN
      warehouse_id,
      tenant_id,
      product_variant_id,
      quantity,
    ]);
  }

  /**
   * Decrements stock for sale items. Composite items are exploded recursively
   * to their leaf children before consuming. Throws if any leaf would go below
   * zero so the surrounding transaction can rollback.
   */
  async consumeStockForSale(
    tenantId: string,
    warehouseId: string,
    items: Array<{ product_variant_id: string; quantity: number }>,
    txn: {
      query: (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount?: number | null }>;
    },
  ): Promise<void> {
    for (const item of items) {
      const leaves = await explodeForInventory(
        txn,
        tenantId,
        item.product_variant_id,
        Number(item.quantity),
      );
      for (const leaf of leaves) {
        const stockRes = await txn.query(
          `SELECT COALESCE(stock, 0)::numeric AS stock
           FROM inventory_schema.inventory
           WHERE tenant_id = $1 AND product_variant_id = $2 AND warehouse_id = $3
           LIMIT 1`,
          [tenantId, leaf.product_variant_id, warehouseId],
        );
        const current = Number(stockRes.rows[0]?.stock ?? 0);
        if (current < leaf.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para variante ${leaf.product_variant_id}: disponible ${current}, requerido ${leaf.quantity}`,
          );
        }
        await txn.query(inventoryQueries.removeStock, [
          leaf.quantity,
          warehouseId,
          leaf.product_variant_id,
          tenantId,
        ]);
        await txn.query(inventoryQueries.logInventoryMovement, [
          2, // OUT
          warehouseId,
          tenantId,
          leaf.product_variant_id,
          leaf.quantity,
        ]);
      }
    }
  }

  async listTransfersByTenant(
    tenant_id: string,
  ): Promise<InventoryTransferSummary[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const { rows } = await this.db.query(
      inventoryQueries.getInventoryTransfersByTenant,
      [tenant_id],
    );
    return rows as InventoryTransferSummary[];
  }

  async moveProductToWarehouse(
    origin_warehouse_id: string,
    destination_warehouse_id: string,
    tenant_id: string,
    products: InventoryTransferProduct[],
    departure_date?: string | null,
    arrival_date?: string | null,
  ) {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    if (origin_warehouse_id === destination_warehouse_id)
      throw new BadRequestException(
        'Origin and destination warehouses must be different',
      );

    if (!products || products.length === 0)
      throw new BadRequestException(
        'At least one product is required to transfer',
      );

    const origin = await this.db.query(inventoryQueries.byTenantAndId, [
      origin_warehouse_id,
      tenant_id,
    ]);
    if (origin.rowCount === 0)
      throw new NotFoundException(
        `Origin warehouse ${origin_warehouse_id} not found for tenant ${tenant_id}`,
      );

    const destination = await this.db.query(inventoryQueries.byTenantAndId, [
      destination_warehouse_id,
      tenant_id,
    ]);
    if (destination.rowCount === 0)
      throw new NotFoundException(
        `Destination warehouse ${destination_warehouse_id} not found for tenant ${tenant_id}`,
      );

    const txn = await this.db.transaction();
    let committed = false;
    try {
      const { rows: transferRows } = await txn.query(
        inventoryQueries.createInventoryTransfer,
        [origin_warehouse_id, destination_warehouse_id, departure_date ?? null, arrival_date ?? null],
      );
      const transfer = transferRows[0] as InventoryTransfer;

      for (const product of products) {
        if (product.amount <= 0)
          throw new BadRequestException(
            `Quantity for product ${product.product_id} must be greater than zero`,
          );

        const { rowCount: outCount, rows: outRows } = await txn.rawQuery(
          `UPDATE inventory_schema.inventory
             SET stock = stock - $1, updated_at = NOW()
           WHERE warehouse_id = $2
             AND product_variant_id = $3
             AND tenant_id = $4
             AND stock >= $1
           RETURNING stock`,
          [
            product.amount,
            origin_warehouse_id,
            product.product_id,
            tenant_id,
          ],
        );

        if (outCount === 0 || outRows.length === 0)
          throw new BadRequestException(
            `Insufficient stock for product ${product.product_id} in origin warehouse`,
          );

        const { rowCount: inCount } = await txn.query(
          inventoryQueries.addStock,
          [
            product.amount,
            destination_warehouse_id,
            product.product_id,
            tenant_id,
          ],
        );
        if (inCount === 0) {
          await txn.query(inventoryQueries.insertIntoInventory, [
            tenant_id,
            destination_warehouse_id,
            product.product_id,
            product.amount,
            null,
          ]);
        }

        await txn.query(inventoryQueries.addProductToInventoryTransfer, [
          transfer.inventory_transfer_id,
          tenant_id,
          product.product_id,
          product.amount,
        ]);

        await txn.query(inventoryQueries.logInventoryMovement, [
          2,
          origin_warehouse_id,
          tenant_id,
          product.product_id,
          product.amount,
        ]);
        await txn.query(inventoryQueries.logInventoryMovement, [
          1,
          destination_warehouse_id,
          tenant_id,
          product.product_id,
          product.amount,
        ]);
      }

      await txn.commit();
      committed = true;
      return {
        message: 'Products transferred successfully between warehouses',
        inventory_transfer_id: transfer.inventory_transfer_id,
      };
    } catch (error) {
      if (!committed) {
        try {
          await txn.rollback();
        } catch (rollbackError) {
          console.error(
            '[WarehouseService.moveProductToWarehouse] Rollback failed:',
            rollbackError,
          );
        }
      }
      throw error;
    }
  }

  async applyDiscrepancyAdjustment(
    discrepancyCountId: string,
    tenantId: string,
  ) {
    const tenant = this.state.getTenant(tenantId);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);

    const { rows } = await this.db.query(
      inventoryQueries.getDiscrepancyReportById,
      [tenantId, discrepancyCountId],
    );
    if (rows.length === 0)
      throw new NotFoundException(
        `Discrepancy Report with ID ${discrepancyCountId} not found`,
      );

    const report = rows[0];

    if (report.is_applied)
      throw new ConflictException(
        `Discrepancy Report ${discrepancyCountId} has already been applied`,
      );

    const { warehouse_id, product_variant_id, stored_quantity, physical_quantity } = report;
    const delta = physical_quantity - stored_quantity;

    const txn = await this.db.transaction();
    try {
      if (delta > 0) {
        await txn.query(inventoryQueries.addStock, [delta, warehouse_id, product_variant_id, tenantId]);
        await txn.query(inventoryQueries.logInventoryMovement, [1, warehouse_id, tenantId, product_variant_id, delta]);
      } else if (delta < 0) {
        await txn.query(inventoryQueries.removeStock, [Math.abs(delta), warehouse_id, product_variant_id, tenantId]);
        await txn.query(inventoryQueries.logInventoryMovement, [2, warehouse_id, tenantId, product_variant_id, Math.abs(delta)]);
      }
      await txn.query(inventoryQueries.applyDiscrepancyReport, [discrepancyCountId, tenantId]);
      await txn.commit();
      return { success: true };
    } catch (error) {
      await txn.rollback();
      throw error;
    }
  }

  async getExpiringProducts(
    tenant_id: string,
    days: number = 30,
  ): Promise<any[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const { rows } = await this.db.query(
      inventoryQueries.getExpiringStock,
      [tenant_id, days],
    );
    return rows;
  }

  @Cron('0 8 * * *')
  async notifyExpiringProducts() {
    const logger = new Logger('WarehouseScheduler');
    logger.log('[IN-04] Checking products expiring in the next 7 days...');
    // Integrar con sistema de notificaciones cuando esté disponible
  }
}
