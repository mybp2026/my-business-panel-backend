import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaysheetService } from './paysheet.service';

@Controller('paysheet')
export class PaysheetController {
  constructor(private readonly paysheetService: PaysheetService) {}
  
  @Get("find")
  async getPaysheetByPeriod(
    @Query("start") periodStart: string,
    @Query("end") periodEnd: string,
    @Query("branchId") branchId: string,
  ) {
    return this.paysheetService.getPaysheetByPeriod(
      branchId,
      periodStart,
      periodEnd,
    )
  }
  
  @Get("tenant/:tenantId")
  async getPaysheetsByTenant(@Param("tenantId") tenantId: string) {
    return this.paysheetService.getPaysheetsByTenant(tenantId);
  }

  @Get("branch/:branchId")
  async getPaysheetByBranch(@Param("branchId") branchId: string) {
    return this.paysheetService.getPaysheetByBranch(branchId);
  }

  @Get(":paysheetId")
  async getPaysheetById(@Param("paysheetId") paysheetId: string) {
    return this.paysheetService.getPaysheetById(paysheetId);
  }

  @Get(":paysheetId/details")
  async getPaysheetDetails(@Param("paysheetId") paysheetId: string) {
    return this.paysheetService.getPaysheetDetails(paysheetId);
  }

  
}
