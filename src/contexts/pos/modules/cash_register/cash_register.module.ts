import { Module } from '@nestjs/common';
import { CashRegisterService } from './cash_register.service';
import { CashRegisterController } from './cash_register.controller';
import { BranchModule } from '@/contexts/general/modules/branch/branch.module';

@Module({
  imports: [BranchModule],
  controllers: [CashRegisterController],
  providers: [CashRegisterService],
})
export class CashRegisterModule {}
