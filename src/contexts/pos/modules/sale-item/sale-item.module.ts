import { Module } from '@nestjs/common';
import { SaleItemService } from './sale-item.service';
import { SaleItemController } from './sale-item.controller';

@Module({
  providers: [SaleItemService],
  controllers: [SaleItemController]
})
export class SaleItemModule {}
