
import { Injectable, Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Database from '@crane-technologies/database';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import { Warehouse } from './interfaces/warehouse.interface';
import { CreateWarehouseDto } from './dto/create_warehouse.dto';
import { generalQueries } from '@general/general.queries';
import { ProductService } from '@/contexts/general/modules/product/product.service';
import { ProductCount } from './interfaces/product_count.interface';
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

    const { rows } = await this.db.query(inventoryQueries.create, [
      createWarehouseDto.branch_id,
      createWarehouseDto.warehouse_name,
      createWarehouseDto.warehouse_address,
    ]);

    return rows[0] ?? new NotFoundException('Warehouse could not be created');
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
    // console.log(warehouse.rows);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found for Tenant with ID ${tenant_id}`,
      );

    await this.db.query(inventoryQueries.delete, [warehouse_id]);
    return { message: 'Warehouse deleted successfully' };
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

  // Verifica que el warehouse pertenezca al tenant
  const warehouse = await this.db.query(warehouseQueries.byTenantAndId, [
    warehouse_id,
    tenant_id,
  ]);
  if (warehouse.rowCount === 0)
    throw new NotFoundException(
      `Warehouse with ID ${warehouse_id} not found for Tenant with ID ${tenant_id}`,
    );

  const { rows } = await this.db.query(warehouseQueries.countAllInWarehouse, [
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
<<<<<<< HEAD:src/modules/warehouse/warehouse.service.ts
      warehouseQueries.getAllDiscrepancyReports,
      [warehouse_id, tenant_id],
=======
      inventoryQueries.getAllDiscrepancyReports,
      [tenant_id, warehouse_id],
>>>>>>> 5eb6eaf1cf7ad37bd0ffda50807eb2c1b02a3178:src/contexts/inventory/modules/warehouse/warehouse.service.ts
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
<<<<<<< HEAD:src/modules/warehouse/warehouse.service.ts
      warehouseQueries.getDiscrepancyReportById,
      [discrepancy_count_id, tenant_id],
=======
      inventoryQueries.getDiscrepancyReportById,
      [tenant_id, discrepancy_count_id],
>>>>>>> 5eb6eaf1cf7ad37bd0ffda50807eb2c1b02a3178:src/contexts/inventory/modules/warehouse/warehouse.service.ts
    );
    if (rows.length === 0)
      throw new NotFoundException(
        `Discrepancy Report with ID ${discrepancy_count_id} not found`,
      );

    return rows[0];
  }

<<<<<<< HEAD:src/modules/warehouse/warehouse.service.ts
 
  async applyDiscrepancyAdjustment(
  discrepancyCountId: string,
  tenantId: string,
) {
  const tenant = this.state.getTenant(tenantId);
  if (!tenant)
    throw new NotFoundException(`Tenant with ID ${tenantId} not found`);

  const { rows } = await this.db.query(
    warehouseQueries.getDiscrepancyReportById,
    [discrepancyCountId, tenantId],
  );
  if (rows.length === 0)
    throw new NotFoundException(
      `Discrepancy Report with ID ${discrepancyCountId} not found`,
=======
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

  // TODO: envolver en transacción con this.db.transaction()
  // TODO: se debe registrar el movimiento IN en inventory_log y el movimiento OUT también
  async moveProductToWarehouse(
    origin_warehouse_id: string,
    destination_warehouse_id: string,
    tenant_id: string,
    products: InventoryTransferProduct[],
  ) {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const transfer_creator = await this.db.query(
      inventoryQueries.createInventoryTransfer,
      [tenant_id, origin_warehouse_id, destination_warehouse_id],
>>>>>>> 5eb6eaf1cf7ad37bd0ffda50807eb2c1b02a3178:src/contexts/inventory/modules/warehouse/warehouse.service.ts
    );

  const report = rows[0];

<<<<<<< HEAD:src/modules/warehouse/warehouse.service.ts
  if (report.is_applied)
     throw new ConflictException(
      `Discrepancy Report ${discrepancyCountId} has already been applied`,
    );

  const { warehouse_id, product_variant_id, stored_quantity, physical_quantity } = report;
  const delta = physical_quantity - stored_quantity;

  // Usar transacción manual
  const txn = await this.db.transaction();
  try {
    if (delta > 0) {
      await txn.query(warehouseQueries.addStock, [delta, warehouse_id, product_variant_id, tenantId]);
      await txn.query(warehouseQueries.logInventoryMovement, [1, warehouse_id, tenantId, product_variant_id, delta]);
    } else if (delta < 0) {
      await txn.query(warehouseQueries.removeStock, [Math.abs(delta), warehouse_id, product_variant_id, tenantId]);
      await txn.query(warehouseQueries.logInventoryMovement, [2, warehouse_id, tenantId, product_variant_id, Math.abs(delta)]);
=======
    for (const product of products) {
      await this.db.query(inventoryQueries.addProductToInventoryTransfer, [
        transfer.inventory_transfer_id,
        tenant_id,
        product.product_id,
        product.amount,
      ]);
>>>>>>> 5eb6eaf1cf7ad37bd0ffda50807eb2c1b02a3178:src/contexts/inventory/modules/warehouse/warehouse.service.ts
    }
    await txn.query(warehouseQueries.applyDiscrepancyReport, [discrepancyCountId, tenantId]);
    await txn.commit();
    // Obtener el resultado final si es necesario (puedes ajustar según lo que devuelva applyDiscrepancyReport)
    return { success: true };
  } catch (error) {
    await txn.rollback();
    throw error;
  }
}

   async moveProductToWarehouse(
    originWarehouseId: string,
    destinationWarehouseId: string,
    tenantId: string,
    products: InventoryTransferProductDto[],
  ) {
    const tenant = this.state.getTenant(tenantId);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);

    const originWarehouse = await this.db.query(warehouseQueries.byId, [
      originWarehouseId,
    ]);
    if (originWarehouse.rowCount === 0)
      throw new NotFoundException(
        `Origin warehouse with ID ${originWarehouseId} not found`,
      );

    const destinationWarehouse = await this.db.query(warehouseQueries.byId, [
      destinationWarehouseId,
    ]);
    if (destinationWarehouse.rowCount === 0)
      throw new NotFoundException(
        `Destination warehouse with ID ${destinationWarehouseId} not found`,
      );

    if (!products || products.length === 0)
      throw new NotFoundException('Products list cannot be empty');

    // Usar transacción manual
    const txn = await this.db.transaction();
    try {
      // Crear transferencia de inventario
      const transferRes = await txn.query(warehouseQueries.createInventoryTransfer, [originWarehouseId, destinationWarehouseId]);
      const transferId = transferRes.rows[0]?.id ?? null;

      for (const p of products) {
        // Bloqueo y verificación de stock
        const { rows: lockRows } = await txn.query(
          `SELECT stock FROM inventory_schema.inventory
           WHERE warehouse_id = $1 AND product_variant_id = $2 AND tenant_id = $3
           FOR UPDATE`,
          [originWarehouseId, p.product_id, tenantId],
        );
        if (!lockRows[0] || lockRows[0].stock < p.amount)
          throw new NotFoundException(
            `Insufficient stock for product ${p.product_id} in warehouse ${originWarehouseId}`,
          );

        // Remover stock del origen
        await txn.query(warehouseQueries.removeStock, [p.amount, originWarehouseId, p.product_id, tenantId]);
        // Agregar stock al destino
        await txn.query(warehouseQueries.addStock, [p.amount, destinationWarehouseId, p.product_id, tenantId]);
        // Registrar producto en la transferencia
        await txn.query(warehouseQueries.addProductToInventoryTransfer, [transferId, tenantId, p.product_id, p.amount]);
        // Log movimientos
        await txn.query(warehouseQueries.logInventoryMovement, [2, originWarehouseId, tenantId, p.product_id, p.amount]);
        await txn.query(warehouseQueries.logInventoryMovement, [1, destinationWarehouseId, tenantId, p.product_id, p.amount]);
      }
      await txn.commit();
      return { transferId };
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
    warehouseQueries.getExpiringStock,
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