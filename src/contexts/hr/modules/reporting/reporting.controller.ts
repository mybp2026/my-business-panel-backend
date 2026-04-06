import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  // -------------------------------------------------------
  // 1. PROFITABILITY BY PRODUCT
  // -------------------------------------------------------

  @Get('profitability/product/:tenantId')
  getProfitabilityByProduct(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportingService.getProfitabilityByProduct(
      tenantId,
      start,
      end,
    );
  }

  // -------------------------------------------------------
  // 2. PROFITABILITY BY SALE
  // -------------------------------------------------------

  @Get('profitability/sale/:tenantId')
  getProfitabilityBySale(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportingService.getProfitabilityBySale(tenantId, start, end);
  }

  // -------------------------------------------------------
  // 3. P&L — INCOME STATEMENT
  // -------------------------------------------------------

  @Get('income-statement/:tenantId')
  getIncomeStatement(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportingService.getIncomeStatement(tenantId, start, end);
  }

  // -------------------------------------------------------
  // 4. EXPENSE REPORTS
  // -------------------------------------------------------

  @Get('expenses/by-category/:tenantId')
  getExpenseSummaryByCategory(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportingService.getExpenseSummaryByCategory(
      tenantId,
      start,
      end,
    );
  }

  @Get('expenses/fixed-vs-variable/:tenantId')
  getExpenseFixedVsVariable(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportingService.getExpenseFixedVsVariable(
      tenantId,
      start,
      end,
    );
  }

  @Get('expenses/monthly-trend/:tenantId')
  getExpenseMonthlyTrend(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportingService.getExpenseMonthlyTrend(tenantId, start, end);
  }

  // -------------------------------------------------------
  // 5. SALES BY SELLER
  // -------------------------------------------------------

  @Get('sales-by-seller/:tenantId')
  getSalesBySeller(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportingService.getSalesBySeller(tenantId, start, end);
  }

  // -------------------------------------------------------
  // 6. FINANCIAL KPIs / DASHBOARD
  // -------------------------------------------------------

  @Get('kpis/:tenantId')
  getFinancialKpis(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportingService.getFinancialKpis(tenantId, start, end);
  }

  // -------------------------------------------------------
  // 7. TRIAL BALANCE
  // -------------------------------------------------------

  @Get('trial-balance/:tenantId')
  getTrialBalance(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportingService.getTrialBalance(tenantId, start, end);
  }
}
