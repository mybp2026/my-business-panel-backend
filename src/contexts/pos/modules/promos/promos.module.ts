import { Module } from '@nestjs/common';
import { StateModule } from '@/contexts/general/modules/state/state.module';
import { PromosService } from './promos.service';
import { PromosController } from './promos.controller';

@Module({
  imports: [StateModule],
  providers: [PromosService],
  controllers: [PromosController],
})
export class PromosModule {}
