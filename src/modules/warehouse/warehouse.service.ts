
import { Injectable, Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Database from '@crane-technologies/database';
import { DATABASE } from '../db/db.provider';
import { Warehouse } from './interfaces/warehouse.interface';
import { CreateWarehouseDto } from './dto/create_warehouse.dto';
import { StateService } from '../state/state.service';
import { queries } from '@/queries';
import { ProductService } from '../product/product.service';
import { ProductCount } from './interfaces/product_count.interface';
import { InvalidTenantError } from '@/common/errors/invalid_tenant.error';
import { InventoryTransferProduct } from './interfaces/inventory_transfer_product.interface';
import { InventoryTransfer } from './interfaces/inventory_transfer.interface';
import { warehouseQueries } from './warehouse.queries';
import { InventoryTransferProductDto } from './dto/inventory_transfer.dto';

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

    const branch = await this.db.query(queries.branch.byIdAndTenant, [
      createWarehouseDto.branch_id,
      tenant_id,
    ]);
    if (branch.rowCount === 0)
      throw new NotFoundException(
        `Branch with ID ${createWarehouseDto.branch_id} not found for Tenant with ID ${tenant_id}`,
      );

    const { rows } = await this.db.query(warehouseQueries.create, [
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

    const warehouse = await this.db.query(warehouseQueries.byTenantAndId, [
      warehouse_id,
      tenant_id,
    ]);
    // console.log(warehouse.rows);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found for Tenant with ID ${tenant_id}`,
      );

    await this.db.query(warehouseQueries.delete, [warehouse_id]);
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

    const warehouse = await this.db.query(warehouseQueries.byId, [
      warehouse_id,
    ]);

    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const product = await this.products.getProductById(product_id, tenant_id);
    if (!product)
      throw new NotFoundException(`Product with ID ${product_id} not found`);

    await this.db.query(warehouseQueries.insertIntoInventory, [
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

    const warehouse = await this.db.query(warehouseQueries.byId, [
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

    await this.db.query(warehouseQueries.addStock, [
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

    await this.db.query(warehouseQueries.removeStock, [
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

    const { rows } = await this.db.query(warehouseQueries.byTenant, [
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

    const branch = await this.db.query(queries.branch.byIdAndTenant, [
      branch_id,
      tenant_id,
    ]);
    if (branch.rowCount === 0)
      throw new NotFoundException(
        `Branch with ID ${branch_id} not found for Tenant with ID ${tenant_id}`,
      );

    const { rows } = await this.db.query(warehouseQueries.byBranch, [
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

    const warehouse = await this.db.query(warehouseQueries.byId, [
      warehouse_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const { rows } = await this.db.query(warehouseQueries.countAllInWarehouse, [
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

    const warehouse = await this.db.query(warehouseQueries.byId, [
      warehouse_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const product = await this.products.getProductById(product_id, tenant_id);
    if (!product)
      throw new NotFoundException(`Product with ID ${product_id} not found`);

    await this.db.query(warehouseQueries.createDiscrepancyReport, [
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

    const warehouse = await this.db.query(warehouseQueries.byId, [
      warehouse_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const { rows } = await this.db.query(
      warehouseQueries.getAllDiscrepancyReports,
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
      warehouseQueries.getDiscrepancyReportById,
      [discrepancy_count_id, tenant_id],
    );
    if (rows.length === 0)
      throw new NotFoundException(
        `Discrepancy Report with ID ${discrepancy_count_id} not found`,
      );

    return rows[0];
  }

 
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
    );

  const report = rows[0];

  if (report.is_applied)
     throw new ConflictException(
      `Discrepancy Report ${discrepancyCountId} has already been applied`,
    );

  const { warehouse_id, product_variant_id, stored_quantity, physical_quantity } = report;
  const delta = physical_quantity - stored_quantity;

  const queryArray: string[] = [];
  const paramsArray: any[][] = [];

  if (delta > 0) {
    queryArray.push(warehouseQueries.addStock,warehouseQueries.logInventoryMovement,);
    paramsArray.push([delta, warehouse_id, product_variant_id, tenantId],[1, warehouse_id, tenantId, product_variant_id, delta]);

  } else if (delta < 0) {
    queryArray.push(warehouseQueries.removeStock, warehouseQueries.logInventoryMovement);

    paramsArray.push([Math.abs(delta), warehouse_id, product_variant_id, tenantId],[2, warehouse_id, tenantId, product_variant_id, Math.abs(delta)]);

   
  }

  queryArray.push(warehouseQueries.applyDiscrepancyReport);
  paramsArray.push([discrepancyCountId, tenantId]);

  const results = await this.db.transaction(queryArray, paramsArray, []);
  return results[results.length - 1].rows[0];
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

    const queryArray: string[] = [];
    const paramsArray: any[][] = [];
    const dependencies: { sourceIndex: number; targetIndex: number; targetParamIndex: number }[] = [];

    queryArray.push(warehouseQueries.createInventoryTransfer);
    paramsArray.push([originWarehouseId, destinationWarehouseId]);

    for (const p of products) {
  const { rows: lockRows } = await this.db.query(
    `SELECT stock FROM inventory_schema.inventory
     WHERE warehouse_id = $1 AND product_variant_id = $2 AND tenant_id = $3
     FOR UPDATE`,
    [originWarehouseId, p.product_id, tenantId],
  );
  if (!lockRows[0] || lockRows[0].stock < p.amount)
    throw new NotFoundException(
      `Insufficient stock for product ${p.product_id} in warehouse ${originWarehouseId}`,
    );
}

    for (const p of products) {
      const base = queryArray.length;

      queryArray.push(warehouseQueries.removeStock);
      paramsArray.push([p.amount, originWarehouseId, p.product_id, tenantId]);

      queryArray.push(warehouseQueries.addStock);
      paramsArray.push([p.amount, destinationWarehouseId, p.product_id, tenantId]);

      queryArray.push(warehouseQueries.addProductToInventoryTransfer);
      paramsArray.push([null, tenantId, p.product_id, p.amount]);
      dependencies.push({
        sourceIndex: 0,
        targetIndex: base + 2,
        targetParamIndex: 0,
      });

      queryArray.push(warehouseQueries.logInventoryMovement);
      paramsArray.push([2, originWarehouseId, tenantId, p.product_id, p.amount]);

      queryArray.push(warehouseQueries.logInventoryMovement);
      paramsArray.push([1, destinationWarehouseId, tenantId, p.product_id, p.amount]);
    }

    const results = await this.db.transaction(queryArray, paramsArray, dependencies);
    return results[0].rows[0];
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