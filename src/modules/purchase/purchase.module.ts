import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [WarehouseModule, AccountingModule],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {}
