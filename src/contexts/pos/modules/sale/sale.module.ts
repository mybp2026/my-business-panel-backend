import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { CustomerPaymentService } from '../../../general/modules/customer_payment/customer-payment.service';
import { DInvoiceService } from '../d-invoice/d-invoice.service';
import { EInvoiceModule } from '../e-invoice/e-invoice.module';
import { AccountingModule } from '../../../finances/modules/accounting/accounting.module';
import { SaleItemService } from '../sale-item/sale-item.service';
import { WarehouseModule } from '@/contexts/inventory/modules/warehouse/warehouse.module';

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
