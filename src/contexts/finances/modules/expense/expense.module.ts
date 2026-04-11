import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService],
  imports: [AccountingModule],
  exports: [ExpenseService],
})
export class ExpenseModule {}
