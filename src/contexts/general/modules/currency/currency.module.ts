import { Module } from '@nestjs/common';

import { StateModule } from '@/contexts/general/modules/state/state.module';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';

@Module({
  imports: [StateModule],
  providers: [CurrencyService],
  controllers: [CurrencyController],
  exports: [CurrencyService],
})
export class CurrencyModule {}
