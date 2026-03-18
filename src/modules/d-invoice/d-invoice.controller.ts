import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { DInvoiceService } from './d-invoice.service';

@Controller('invoice')
export class DInvoiceController {
  constructor(private readonly invoiceService: DInvoiceService) {}

  @Get(':id')
  async getTenantDInvoices(@Param('id') id: string) {
    return this.invoiceService.getTenantDInvoices(id);
  }

  @Get('details/:id')
  async getDInvoiceById(@Param('id') id: string) {
    return this.invoiceService.getDInvoiceById(id);
  }

  @Get()
  async getCustomerDInvoices(
    @Query('id') tenantId: string,
    @Query('doc') doc: string,
  ) {
    return this.invoiceService.getCustomerDInvoices(tenantId, doc);
  }

  @Delete(':id')
  async deleteDInvoice(@Param('id') id: string) {
    return this.invoiceService.deleteDInvoice(id);
  }
}
