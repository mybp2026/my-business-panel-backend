import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
@Controller('sale')
@UseGuards(AuthenticationGuard)
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

  @Get('tenant/all')
  async getAllSalesByTenant(
    @Req() req: any,
    @Query('limit') limit = '100',
    @Query('offset') offset = '0',
  ) {
    return this.saleService.getAllSalesByTenant(
      req.user.tenant_id,
      parseInt(limit, 10),
      parseInt(offset, 10),
    );
  }

  @ApiOperation(getAllSalesByBranchDoc.operation)
  @ApiResponse(getAllSalesByBranchDoc.responses[200])
  @ApiResponse(getAllSalesByBranchDoc.responses[401])
  @Get(':branch_id')
  @Paginate({
    table: `(SELECT s.sale_id, s.sale_date, s.total_amount, s.subtotal_amount, s.tax_amount, s.is_completed, s.has_electronic_invoice, s.is_refunded, s.tenant_customer_id, s.created_at, b.branch_id, b.branch_name, c.currency_code, c.symbol,
        (SELECT rt.return_transaction_id FROM pos_schema.return_transaction rt
          LEFT JOIN pos_schema.digital_sale_invoice dsi ON dsi.digital_sale_invoice_id = rt.digital_sale_invoice_id
          LEFT JOIN pos_schema.electronic_sale_invoice esi ON esi.electronic_sale_invoice_id = rt.electronic_sale_invoice_id
          WHERE dsi.sale_id = s.sale_id OR esi.sale_id = s.sale_id LIMIT 1) AS return_transaction_id
        FROM pos_schema.sale s INNER JOIN general_schema.branch b USING(branch_id) INNER JOIN general_schema.currency c USING(currency_id)) AS paginated_sales`,
    columns: [
      'sale_id',
      'sale_date',
      'total_amount',
      'subtotal_amount',
      'tax_amount',
      'is_completed',
      'has_electronic_invoice',
      'is_refunded',
      'branch_id',
      'branch_name',
      'currency_code',
      'symbol',
      'tenant_customer_id',
      'created_at',
      'return_transaction_id',
    ],
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
  async getEInvoicesByBranch(
    @Param('branch_id') branchId: string,
    @Req() req: any,
  ) {
    return this.eInvoiceService.getEInvoiceByBranch(
      branchId,
      req.user.tenant_id,
    );
  }

  @ApiOperation(getEInvoiceByIdDoc.operation)
  @ApiResponse(getEInvoiceByIdDoc.responses[200])
  @ApiResponse(getEInvoiceByIdDoc.responses[401])
  @ApiResponse(getEInvoiceByIdDoc.responses[404])
  @Get('e-invoice/:invoice_id')
  async getEInvoiceById(
    @Param('invoice_id') invoiceId: string,
    @Req() req: any,
  ) {
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
