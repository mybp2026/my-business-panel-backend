import { Controller, Get, Param, Query } from '@nestjs/common';
import { TardinessService } from './tardiness.service';

@Controller('tardiness')
export class TardinessController {
  constructor(private readonly tardinessService: TardinessService) {}

  @Get('employee/:employeeId')
  async getTardinessByEmployee(@Param('employeeId') employeeId: string) {
    return this.tardinessService.getTardinessByEmployee(employeeId);
  }

  @Get('branch/:branchId')
  async getTardinessByBranch(@Param('branchId') branchId: string) {
    return this.tardinessService.getTardinessByBranch(branchId);
  }

  @Get('period')
  async getTardinessByDateRange(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
    @Query('branchId') branchId: string,
  ) {
    return this.tardinessService.getTardinessByDateRange(
      startDate,
      endDate,
      branchId,
    );
  }
}
