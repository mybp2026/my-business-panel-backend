import { Module } from '@nestjs/common';

import { StateModule } from '../state/state.module';

import { SpecialCodeController } from './special_code.controller';
import { SpecialCodeService } from './special_code.service';

@Module({
  imports: [StateModule],
  controllers: [SpecialCodeController],
  providers: [SpecialCodeService],
  exports: [SpecialCodeService],
})
export class SpecialCodeModule {}
