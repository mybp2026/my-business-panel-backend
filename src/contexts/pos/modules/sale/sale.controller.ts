import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SaleService } from './sale.service';
import { FullSaleDto } from './dto/sales.dto';
import { DATABASE } from '../../../general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { EInvoiceService } from '../e-invoice/e-invoice.service';
import {
  Paginate,
  PaginatedResult,
} from '@/common/decorators/paginator.decorator';
import {
  getSaleConditionsDoc,
  createFullSaleDoc,
  getAllSalesByBranchDoc,
  getEInvoicesByBranchDoc,
  getEInvoiceByIdDoc,
  getEInvoiceForSaleDoc,
  createEInvoiceForSaleDoc,
} from '@/docs/contexts/pos/sale';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';

@ApiTags('Sale')
@UseGuards(AuthenticationGuard)
@Controller('sale')
export class SaleController {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly saleService: SaleService,
    private readonly eInvoiceService: EInvoiceService,
  ) {}

  @ApiOperation(getSaleConditionsDoc.operation)
  @ApiResponse(getSaleConditionsDoc.responses[200])
  @ApiResponse(getSaleConditionsDoc.responses[401])
  @Get()
  getSaleConditions() {
    return this.saleService.getAllConditions();
  }

  @ApiOperation(createFullSaleDoc.operation)
  @ApiResponse(createFullSaleDoc.responses[201])
  @ApiResponse(createFullSaleDoc.responses[400])
  @ApiResponse(createFullSaleDoc.responses[401])
  @Post()
  async createFullSale(@Body() req: FullSaleDto) {
    return this.saleService.createFullSale(req);
  }

  @ApiOperation(getAllSalesByBranchDoc.operation)
  @ApiResponse(getAllSalesByBranchDoc.responses[200])
  @ApiResponse(getAllSalesByBranchDoc.responses[401])
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

  @ApiOperation(getEInvoicesByBranchDoc.operation)
  @ApiResponse(getEInvoicesByBranchDoc.responses[200])
  @ApiResponse(getEInvoicesByBranchDoc.responses[401])
  @Get('e-invoice/branch/:branch_id')
  async getEInvoicesByBranch(@Param('branch_id') branchId: string, @Req() req: any) {
    return this.eInvoiceService.getEInvoiceByBranch(branchId, req.user.tenant_id);
  }

  @ApiOperation(getEInvoiceByIdDoc.operation)
  @ApiResponse(getEInvoiceByIdDoc.responses[200])
  @ApiResponse(getEInvoiceByIdDoc.responses[401])
  @ApiResponse(getEInvoiceByIdDoc.responses[404])
  @Get('e-invoice/:invoice_id')
  async getEInvoiceById(@Param('invoice_id') invoiceId: string, @Req() req: any) {
    return this.eInvoiceService.getEInvoiceById(invoiceId, req.user.tenant_id);
  }

  @ApiOperation(getEInvoiceForSaleDoc.operation)
  @ApiResponse(getEInvoiceForSaleDoc.responses[200])
  @ApiResponse(getEInvoiceForSaleDoc.responses[401])
  @ApiResponse(getEInvoiceForSaleDoc.responses[404])
  @Get(':sale_id/e-invoice')
  async getEInvoiceForSale(@Param('sale_id') saleId: string, @Req() req: any) {
    return this.eInvoiceService.getEInvoiceForSale(saleId, req.user.tenant_id);
  }

  @ApiOperation(createEInvoiceForSaleDoc.operation)
  @ApiResponse(createEInvoiceForSaleDoc.responses[201])
  @ApiResponse(createEInvoiceForSaleDoc.responses[400])
  @ApiResponse(createEInvoiceForSaleDoc.responses[401])
  @Post(':sale_id/e-invoice')
  async createEInvoiceForSale(@Param('sale_id') saleId: string) {
    return this.eInvoiceService.createEInvoiceForSale(saleId);
  }
}
