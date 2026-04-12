import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PayrollService } from './service/payroll.service';
import { CreatePaysheetDto, ProcessPaysheetDto } from './dto/create-paysheet.dto';
import { CalculationEngine } from './service/calc-engine.service';
import {
  createPaysheetDoc,
  processPayrollDoc,
} from '@/docs/contexts/hr/payroll';

@ApiTags('Payroll')
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService, private readonly engine: CalculationEngine) {}

  @ApiOperation(createPaysheetDoc.operation)
  @ApiResponse(createPaysheetDoc.responses[201])
  @ApiResponse(createPaysheetDoc.responses[400])
  @ApiResponse(createPaysheetDoc.responses[401])
  @Post('create')
  async createPaysheet(@Body() body: CreatePaysheetDto) {
    return this.payrollService.createPaysheetHeader(body);
  }

  @ApiOperation(processPayrollDoc.operation)
  @ApiResponse(processPayrollDoc.responses[200])
  @ApiResponse(processPayrollDoc.responses[400])
  @ApiResponse(processPayrollDoc.responses[401])
  @ApiResponse(processPayrollDoc.responses[404])
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
