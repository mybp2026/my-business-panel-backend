import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { WarehouseModule } from '@/contexts/inventory/modules/warehouse/warehouse.module';
import { AccountingModule } from '@/contexts/finances/modules/accounting/accounting.module';

@Module({
  imports: [WarehouseModule, AccountingModule],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {}
