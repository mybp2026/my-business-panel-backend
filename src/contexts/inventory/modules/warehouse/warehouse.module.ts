import { Module } from '@nestjs/common';
import { StateModule } from '@/contexts/general/modules/state/state.module';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { ProductModule } from '@/contexts/general/modules/product/product.module';

@Module({
  imports: [StateModule, ProductModule],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
