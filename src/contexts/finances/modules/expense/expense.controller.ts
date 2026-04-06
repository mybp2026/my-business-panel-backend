import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import {
  CreateExpenseCategoryDto,
  CreateExpenseDto,
  CreateFiscalPeriodDto,
  UpdateExpenseCategoryDto,
} from './dto/expense.dto';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  // -------------------------------------------------------
  // EXPENSE CATEGORIES
  // -------------------------------------------------------

  @Get('categories/:tenantId')
  getCategoriesByTenant(@Param('tenantId') tenantId: string) {
    return this.expenseService.getCategoriesByTenant(tenantId);
  }

  @Get('categories/:tenantId/:categoryId')
  getCategoryById(
    @Param('categoryId') categoryId: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.expenseService.getCategoryById(categoryId, tenantId);
  }

  @Post('categories')
  createCategory(@Body() data: CreateExpenseCategoryDto) {
    return this.expenseService.createCategory(data);
  }

  @Patch('categories/:tenantId/:categoryId')
  updateCategory(
    @Param('categoryId') categoryId: string,
    @Param('tenantId') tenantId: string,
    @Body() data: UpdateExpenseCategoryDto,
  ) {
    return this.expenseService.updateCategory(categoryId, tenantId, data);
  }

  @Post('categories/provision/:tenantId')
  provisionCategories(@Param('tenantId') tenantId: string) {
    return this.expenseService.provisionCategories(tenantId);
  }

  // -------------------------------------------------------
  // EXPENSES
  // -------------------------------------------------------

  @Get(':tenantId')
  getExpensesByTenant(@Param('tenantId') tenantId: string) {
    return this.expenseService.getExpensesByTenant(tenantId);
  }

  @Get(':tenantId/branch/:branchId')
  getExpensesByBranch(
    @Param('tenantId') tenantId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.expenseService.getExpensesByBranch(tenantId, branchId);
  }

  @Get(':tenantId/detail/:expenseId')
  getExpenseById(
    @Param('expenseId') expenseId: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.expenseService.getExpenseById(expenseId, tenantId);
  }

  @Get(':tenantId/range')
  getExpensesByDateRange(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.expenseService.getExpensesByDateRange(tenantId, start, end);
  }

  @Post()
  createExpense(@Body() data: CreateExpenseDto) {
    return this.expenseService.createExpense(data);
  }

  // -------------------------------------------------------
  // FISCAL PERIODS
  // -------------------------------------------------------

  @Get('fiscal-periods/:tenantId')
  getFiscalPeriods(@Param('tenantId') tenantId: string) {
    return this.expenseService.getFiscalPeriods(tenantId);
  }

  @Post('fiscal-periods')
  createFiscalPeriod(@Body() data: CreateFiscalPeriodDto) {
    return this.expenseService.createFiscalPeriod(data);
  }

  @Patch('fiscal-periods/:tenantId/:periodId/close')
  closeFiscalPeriod(
    @Param('periodId') periodId: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.expenseService.closeFiscalPeriod(periodId, tenantId);
  }
}
