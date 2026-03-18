import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { SaleItemService } from '../sale-item/sale-item.service';
import { CustomerPaymentService } from '../customer_payment/customer_payment.service';
import { DInvoiceService } from '../d-invoice/d-invoice.service';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { EInvoiceModule } from '../e-invoice/e-invoice.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  providers: [
    SaleService,
    SaleItemService,
    CustomerPaymentService,
    DInvoiceService,
  ],
  controllers: [SaleController],
  imports: [WarehouseModule, EInvoiceModule, AccountingModule],
})
export class SaleModule {}
