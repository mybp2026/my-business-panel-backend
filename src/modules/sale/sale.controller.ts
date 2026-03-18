import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { SaleService } from './sale.service';
import { FullSaleDto } from './dto/sales.dto';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { EInvoiceService } from '../e-invoice/e-invoice.service';
import {
  Paginate,
  PaginatedResult,
} from '@/common/decorators/paginator.decorator';

@Controller('sale')
export class SaleController {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly saleService: SaleService,
    private readonly eInvoiceService: EInvoiceService,
  ) {}

  @Get()
  getSaleConditions() {
    return this.saleService.getAllConditions();
  }

  @Post()
  async createFullSale(@Body() req: FullSaleDto) {
    return this.saleService.createFullSale(req);
  }

  @Get(':branch_id')
  @Paginate({
    table: 'pos_schema.sale',
    columns: ['sale_id', 'branch_id', 'tenant_customer_id', 'created_at'],
    pkFields: ['sale_id'],
    whereFields: ['branch_id'],
  })
  getAllSalesByBranch(
    @Param('branch_id') branch_id: string,
    @PaginatedResult() result: any,
  ) {
    return result;
  }

  // E-invoice routes — serviced by EInvoiceModule

  @Get('e-invoice/branch/:branch_id')
  async getEInvoicesByBranch(@Param('branch_id') branchId: string) {
    return this.eInvoiceService.getEInvoiceByBranch(branchId);
  }

  @Get('e-invoice/:invoice_id')
  async getEInvoiceById(@Param('invoice_id') invoiceId: string) {
    return this.eInvoiceService.getEInvoiceById(invoiceId);
  }

  @Get(':sale_id/e-invoice')
  async getEInvoiceForSale(@Param('sale_id') saleId: string) {
    return this.eInvoiceService.getEInvoiceForSale(saleId);
  }

  @Post(':sale_id/e-invoice')
  async createEInvoiceForSale(@Param('sale_id') saleId: string) {
    return this.eInvoiceService.createEInvoiceForSale(saleId);
  }
}
