import { Module } from '@nestjs/common';
import { PosExpenseController } from './pos-expense.controller';
import { PosExpenseService } from './pos-expense.service';

@Module({
  controllers: [PosExpenseController],
  providers: [PosExpenseService],
})
export class PosExpenseModule {}
