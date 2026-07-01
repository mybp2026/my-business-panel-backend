import { Module } from '@nestjs/common';
import { IvaController } from './iva.controller';
import { IvaService } from './iva.service';

@Module({
  controllers: [IvaController],
  providers: [IvaService],
})
export class IvaModule {}
