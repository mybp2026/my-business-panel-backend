import { Controller, Delete, Get, Param } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { Warehouse } from './interfaces/warehouse.interface';
import { CreateWarehouseDto } from './dto/create_warehouse.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
// import { LevelAuthorizationGuard } from "@/common/guards/level_authorization.guard";
import { UseGuards } from '@nestjs/common';
import { Body, Post } from '@nestjs/common';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { AddProductToWarehouseDto } from './dto/add_product_to_warehouse.dto';
import { CreateDiscrepancyReport } from './dto/create_discrepancy_report.dto';
import { CountAllInWarehouseDto } from './dto/count_all_in_warehouse.dto';
import { InventoryTransferProduct } from './interfaces/inventory_transfer_product.interface';
import {
  InventoryTransferDto,
  InventoryTransferProductDto,
} from './dto/inventory_transfer.dto';

@UseGuards(AuthenticationGuard)
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  createWarehouse(
    @Body() createWarehouseDto: CreateWarehouseDto,
    @Session() userSession: IUserSession,
  ) {
    return this.warehouseService.createWarehouse(
      createWarehouseDto,
      userSession.tenant_id,
    );
  }

  @Delete(':warehouse_id')
  deleteWarehouse(
    @Param('warehouse_id') warehouse_id: string,
    @Session() userSession: IUserSession,
  ) {
    return this.warehouseService.deleteWarehouse(
      warehouse_id,
      userSession.tenant_id,
    );
  }

  @Post('/product')
  addProductToWarehouse(
    @Body() addProductToWarehouseDto: AddProductToWarehouseDto,
    @Session() userSession: IUserSession,
  ) {
    return this.warehouseService.addProductToWarehouse(
      addProductToWarehouseDto.warehouse_id,
      addProductToWarehouseDto.product_id,
      userSession.tenant_id,
      addProductToWarehouseDto.amount,
      addProductToWarehouseDto.expiration_date,
    );
  }

  @Get('tenant/')
  getAllWarehouses(@Session() userSession: IUserSession) {
    return this.warehouseService.getWarehousesByTenant(userSession.tenant_id);
  }

  @Post('count')
  countAllProductsInWarehouse(
    @Body() countAllInWarehouseDto: CountAllInWarehouseDto,
    @Session() userSession: IUserSession,
  ) {
    return this.warehouseService.countAllInWarehouse(
      countAllInWarehouseDto.warehouse_id,
      userSession.tenant_id,
    );
  }

  @Post('discrepancy-report')
  generateDiscrepancyReport(
    @Session() userSession: IUserSession,
    @Body() createDiscrepancyReport: CreateDiscrepancyReport,
  ) {
    return this.warehouseService.createDiscrepancyReport(
      userSession.tenant_id,
      createDiscrepancyReport.product_id,
      createDiscrepancyReport.warehouse_id,
      createDiscrepancyReport.stored_quantity,
      createDiscrepancyReport.physical_quantity,
      createDiscrepancyReport.discrepancy_reason,
    );
  }

  @Get('discrepancy-report/:warehouse_id')
  getAllDiscrepancyReports(
    @Param('warehouse_id') warehouse_id: string,
    @Session() userSession: IUserSession,
  ) {
    return this.warehouseService.getDiscrepancyReports(
      userSession.tenant_id,
      warehouse_id,
    );
  }

  @Get('discrepancy-report/id/:report_id')
  getDiscrepancyReportById(
    @Param('report_id') report_id: string,
    @Session() userSession: IUserSession,
  ) {
    return this.warehouseService.getDiscrepancyReportById(
      userSession.tenant_id,
      report_id,
    );
  }

  @Post('transfer')
  transferInventoryBetweenWarehouses(
    @Session() userSession: IUserSession,
    @Body() body: InventoryTransferDto,
  ) {
    return this.warehouseService.moveProductToWarehouse(
      body.origin_warehouse_id,
      body.destination_warehouse_id,
      userSession.tenant_id,
      body.products,
    );
  }
}
