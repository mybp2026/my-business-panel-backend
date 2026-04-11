import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from '@/app/app.controller';
import { AppService } from '@/app/app.service';
import 'dotenv/config';

// General Modules
import { AuthModule } from '@/contexts/general/modules/auth/auth.module';
import { DbModule } from '@/contexts/general/modules/db/db.module';
import { SubscriptionModule } from '@/contexts/general/modules/subscription/subscription.module';
import { CustomerModule } from '@/contexts/general/modules/customer/customer.module';
import { DocumentTypeModule } from '@/contexts/general/modules/document_type/document-type.module';
import { TenantModule } from '@/contexts/general/modules/tenant/tenant.module';
import { ProductCategoryModule } from '@/contexts/general/modules/product_category/product-category.module';
import { CustomerSegmentMarginModule } from '@/contexts/general/modules/customer_segment_margin/customer_segment_margin.module';
import { StripeModule } from '@/contexts/general/modules/stripe/stripe.module';
import { ProductModule } from '@/contexts/general/modules/product/product.module';
import { CustomerPaymentModule } from '@/contexts/general/modules/customer_payment/customer-payment.module';
import { SegmentModule } from '@/contexts/general/modules/segment/segment.module';
import { BranchModule } from '@/contexts/general/modules/branch/branch.module';

// POS Modules
import { SaleModule } from '@/contexts/pos/modules/sale/sale.module';
import { SaleItemModule } from '@/contexts/pos/modules/sale-item/sale-item.module';
import { DInvoiceModule } from '@/contexts/pos/modules/d-invoice/d-invoice.module';
import { EInvoiceModule } from '@/contexts/pos/modules/e-invoice/e-invoice.module';
import { PromosModule } from '@/contexts/pos/modules/promos/promos.module';
import { ReturnsModule } from '@/contexts/pos/modules/returns/returns.module';
import { CashRegisterModule } from '@/contexts/pos/modules/cash_register/cash_register.module';
import { LoyalProgramModule } from '@/contexts/pos/modules/loyal-program/loyalty-program.module';

// PURCHASE Modules
import { PurchaseModule } from '@/contexts/purchase/modules/purchase/purchase.module';
import { SuppliersModule } from '@/contexts/purchase/modules/suppliers/suppliers.module';

// INVENTORY Modules
import { WarehouseModule } from '@/contexts/inventory/modules/warehouse/warehouse.module';

// HR Modules
import { ClockingModule } from '@/contexts/hr/modules/clocking/clocking.module';
import { EmployeeModule } from '@/contexts/hr/modules/employee/employee.module';
import { ContractModule } from '@/contexts/hr/modules/contract/contract.module';
import { ConceptModule } from '@/contexts/hr/modules/concept/concept.module';
import { PayrollModule } from '@/contexts/hr/modules/payroll/payroll.module';
import { FoulModule } from '@/contexts/hr/modules/foul/foul.module';
import { ReportingModule } from '@/contexts/hr/modules/reporting/reporting.module';
import { PaysheetModule } from '@/contexts/hr/modules/paysheet/paysheet.module';
import { PayrollMovementsModule } from '@/contexts/hr/modules/payroll_movements/payroll-movements.module';
import { IncapacityModule } from '@/contexts/hr/modules/incapacity/incapacity.module';
import { SuspentionModule } from '@/contexts/hr/modules/suspention/suspention.module';
import { TurnsModule } from '@/contexts/hr/modules/turns/turns.module';
import { TardinessModule } from '@/contexts/hr/modules/tardiness/tardiness.module';

import { AccountingModule } from '@/contexts/finances/modules/accounting/accounting.module';
import { ExpenseModule } from '@/contexts/finances/modules/expense/expense.module';

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
    ExpenseModule,
    ReportingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
