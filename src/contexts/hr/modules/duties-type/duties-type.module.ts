import { Module } from '@nestjs/common';
import { DutiesTypeService } from './duties-type.service';
import { DutiesTypeController } from './duties-type.controller';

@Module({
  providers: [DutiesTypeService],
  controllers: [DutiesTypeController],
})
export class DutiesTypeModule {}
