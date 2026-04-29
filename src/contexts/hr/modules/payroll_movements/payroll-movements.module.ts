import { Module } from '@nestjs/common';
import { PayrollMovementsService } from './payroll-movements.service';
import { PayrollMovementsController } from './payroll-movements.controller';

@Module({
  providers: [PayrollMovementsService],
  controllers: [PayrollMovementsController],
})
export class PayrollMovementsModule {}
