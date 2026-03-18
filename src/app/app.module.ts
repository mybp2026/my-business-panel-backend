import { Module } from '@nestjs/common';
import { AppController } from '@/app/app.controller';
import { AppService } from '@/app/app.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { DocumentTypeModule } from '@/modules/document_type/document_type.module';
import { DbModule } from '@/modules/db/db.module';
import { TenantModule } from '@/modules/tenant/tenant.module';
import { ProductCategoryModule } from '@/modules/product_category/product_category.module';
import { CustomerSegmentMarginModule } from '@/modules/customer_segment_margin/customer_segment_margin.module';
import { StripeModule } from '@/modules/stripe/stripe.module';
import { ProductModule } from '@/modules/product/product.module';
import { CustomerPaymentModule } from '@/modules/customer_payment/customer_payment.module';
import { SaleModule } from '@/modules/sale/sale.module';
import { SaleItemModule } from '@/modules/sale-item/sale-item.module';
import { DInvoiceModule } from '@/modules/d-invoice/d-invoice.module';
import { PromosModule } from '@/modules/promos/promos.module';
import { SegmentModule } from '@/modules/segment/segment.module';
import { ReturnsModule } from '@/modules/returns/returns.module';
import { BranchModule } from '@/modules/branch/branch.module';
import { CashRegisterModule } from '@/modules/cash_register/cash_register.module';
import { LoyalProgramModule } from '@/modules/loyal-program/loyal-program.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';
import { ClockingModule } from '@/modules/clocking/clocking.module';
import { EmployeeModule } from '@/modules/employee/employee.module';
import { ContractModule } from '@/modules/contract/contract.module';
import { WarehouseModule } from '@/modules/warehouse/warehouse.module';
import { ConceptModule } from '@/modules/concept/concept.module';
import { PayrollMovementsModule } from '@/modules/payroll_movements/payroll_movements.module';
import { PayrollModule } from '@/modules/payroll/payroll.module';
import { PaysheetModule } from '@/modules/paysheet/paysheet.module';
import { SuppliersModule } from '@/modules/suppliers/suppliers.module';
import { PurchaseModule } from '@/modules/purchase/purchase.module';
import { IncapacityModule } from '@/modules/incapacity/incapacity.module';
import { SuspentionModule } from '@/modules/suspention/suspention.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TurnsModule } from '@/modules/turns/turns.module';
import { FoulModule } from '@/modules/foul/foul.module';
import { TardinessModule } from '@/modules/tardiness/tardiness.module';
import { EInvoiceModule } from '@/modules/e-invoice/e-invoice.module';
import { AccountingModule } from '@/modules/accounting/accounting.module';
require('dotenv').config();

console.log(
  'Initializing AppModule with Stripe API Key length:',
  process.env.STRIPE_API_KEY?.length,
);

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    CustomerModule,
    DocumentTypeModule,
    DbModule,
    TenantModule,
    ProductCategoryModule,
    CustomerSegmentMarginModule,
    ProductModule,
    CustomerPaymentModule,
    StripeModule,
    SaleModule,
    SaleItemModule,
    DInvoiceModule,
    PromosModule,
    SegmentModule,
    ReturnsModule,
    BranchModule,
    CashRegisterModule,
    LoyalProgramModule,
    SubscriptionModule,
    ClockingModule,
    EmployeeModule,
    ContractModule,
    ConceptModule,
    PayrollMovementsModule,
    PayrollModule,
    PaysheetModule,
    WarehouseModule,
    SuppliersModule,
    PurchaseModule,
    IncapacityModule,
    SuspentionModule,
    TurnsModule,
    FoulModule,
    TardinessModule,
    EInvoiceModule,
    AccountingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
