import { Controller, Get, Param } from '@nestjs/common';
import { PayrollMovementsService } from './payroll-movements.service';

@Controller('movements')
export class PayrollMovementsController {
  constructor(private readonly pMovement: PayrollMovementsService) {}

  @Get('paysheet/:paysheetId')
  async getPayrollMovementsByPaysheet(@Param('paysheetId') paysheetId: string) {
    return this.pMovement.getPayrollMovementsByPaysheet(paysheetId);
  }

  @Get('detail/:detailId')
  async getPayrollMovementsByDetail(@Param('detailId') detailId: string) {
    return this.pMovement.getPayrollMovementsByDetail(detailId);
  }
}
