import { Body, Controller, Param, Post } from '@nestjs/common';
import { PayrollService } from './service/payroll.service';
import { CreatePaysheetDto, ProcessPaysheetDto } from './dto/create-paysheet.dto';
import { CalculationEngine } from './service/calc-engine.service';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService, private readonly engine: CalculationEngine) {}

  @Post('create')
  async createPaysheet(@Body() body: CreatePaysheetDto) {
    return this.payrollService.createPaysheetHeader(body);
  }

  @Post(':id/process')
  async processPayroll(
    @Param('id') id: string,
    @Body() body: ProcessPaysheetDto,
  ) {
    return this.payrollService.processPayrollForEmployee(
      id,
      body.branch_id,
      body.tenant_id,
      body.period_start,
      body.period_end,
    );
  }

}
