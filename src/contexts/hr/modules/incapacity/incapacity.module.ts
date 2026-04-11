import { Module } from '@nestjs/common';
import { IncapacityService } from './incapacity.service';
import { IncapacityController } from './incapacity.controller';

@Module({
  providers: [IncapacityService],
  controllers: [IncapacityController]
})
export class IncapacityModule {}
