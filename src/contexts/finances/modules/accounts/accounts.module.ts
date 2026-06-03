import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { StateModule } from '@/contexts/general/modules/state/state.module';

@Module({
  imports: [StateModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
