import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExpenseService } from './expense.service';
import {
  CreateExpenseCategoryDto,
  CreateExpenseDto,
  CreateFiscalPeriodDto,
  UpdateExpenseCategoryDto,
} from './dto/expense.dto';
import {
  getCategoriesByTenantDoc,
  getCategoryByIdDoc,
  createCategoryDoc,
  updateCategoryDoc,
  provisionCategoriesDoc,
  getExpensesByTenantDoc,
  getExpensesByBranchDoc,
  getExpenseByIdDoc,
  getExpensesByDateRangeDoc,
  createExpenseDoc,
  getFiscalPeriodsDoc,
  createFiscalPeriodDoc,
  closeFiscalPeriodDoc,
} from '@/docs/contexts/finances/expense';

@ApiTags('Expense')
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  // -------------------------------------------------------
  // EXPENSE CATEGORIES
  // -------------------------------------------------------

  @ApiOperation(getCategoriesByTenantDoc.operation)
  @ApiResponse(getCategoriesByTenantDoc.responses[200])
  @Get('categories/:tenantId')
  getCategoriesByTenant(@Param('tenantId') tenantId: string) {
    return this.expenseService.getCategoriesByTenant(tenantId);
  }

  @ApiOperation(getCategoryByIdDoc.operation)
  @ApiResponse(getCategoryByIdDoc.responses[200])
  @ApiResponse(getCategoryByIdDoc.responses[404])
  @Get('categories/:tenantId/:categoryId')
  getCategoryById(
    @Param('categoryId') categoryId: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.expenseService.getCategoryById(categoryId, tenantId);
  }

  @ApiOperation(createCategoryDoc.operation)
  @ApiResponse(createCategoryDoc.responses[201])
  @Post('categories')
  createCategory(@Body() data: CreateExpenseCategoryDto) {
    return this.expenseService.createCategory(data);
  }

  @ApiOperation(updateCategoryDoc.operation)
  @ApiResponse(updateCategoryDoc.responses[200])
  @ApiResponse(updateCategoryDoc.responses[404])
  @Patch('categories/:tenantId/:categoryId')
  updateCategory(
    @Param('categoryId') categoryId: string,
    @Param('tenantId') tenantId: string,
    @Body() data: UpdateExpenseCategoryDto,
  ) {
    return this.expenseService.updateCategory(categoryId, tenantId, data);
  }

  @ApiOperation(provisionCategoriesDoc.operation)
  @ApiResponse(provisionCategoriesDoc.responses[201])
  @Post('categories/provision/:tenantId')
  provisionCategories(@Param('tenantId') tenantId: string) {
    return this.expenseService.provisionCategories(tenantId);
  }

  // -------------------------------------------------------
  // EXPENSES
  // -------------------------------------------------------

  @ApiOperation(getExpensesByTenantDoc.operation)
  @ApiResponse(getExpensesByTenantDoc.responses[200])
  @Get(':tenantId')
  getExpensesByTenant(@Param('tenantId') tenantId: string) {
    return this.expenseService.getExpensesByTenant(tenantId);
  }

  @ApiOperation(getExpensesByBranchDoc.operation)
  @ApiResponse(getExpensesByBranchDoc.responses[200])
  @Get(':tenantId/branch/:branchId')
  getExpensesByBranch(
    @Param('tenantId') tenantId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.expenseService.getExpensesByBranch(tenantId, branchId);
  }

  @ApiOperation(getExpenseByIdDoc.operation)
  @ApiResponse(getExpenseByIdDoc.responses[200])
  @ApiResponse(getExpenseByIdDoc.responses[404])
  @Get(':tenantId/detail/:expenseId')
  getExpenseById(
    @Param('expenseId') expenseId: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.expenseService.getExpenseById(expenseId, tenantId);
  }

  @ApiOperation(getExpensesByDateRangeDoc.operation)
  @ApiResponse(getExpensesByDateRangeDoc.responses[200])
  @Get(':tenantId/range')
  getExpensesByDateRange(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.expenseService.getExpensesByDateRange(tenantId, start, end);
  }

  @ApiOperation(createExpenseDoc.operation)
  @ApiResponse(createExpenseDoc.responses[201])
  @ApiResponse(createExpenseDoc.responses[400])
  @ApiResponse(createExpenseDoc.responses[404])
  @Post()
  createExpense(@Body() data: CreateExpenseDto) {
    return this.expenseService.createExpense(data);
  }

  // -------------------------------------------------------
  // FISCAL PERIODS
  // -------------------------------------------------------

  @ApiOperation(getFiscalPeriodsDoc.operation)
  @ApiResponse(getFiscalPeriodsDoc.responses[200])
  @Get('fiscal-periods/:tenantId')
  getFiscalPeriods(@Param('tenantId') tenantId: string) {
    return this.expenseService.getFiscalPeriods(tenantId);
  }

  @ApiOperation(createFiscalPeriodDoc.operation)
  @ApiResponse(createFiscalPeriodDoc.responses[201])
  @Post('fiscal-periods')
  createFiscalPeriod(@Body() data: CreateFiscalPeriodDto) {
    return this.expenseService.createFiscalPeriod(data);
  }

  @ApiOperation(closeFiscalPeriodDoc.operation)
  @ApiResponse(closeFiscalPeriodDoc.responses[200])
  @ApiResponse(closeFiscalPeriodDoc.responses[400])
  @Patch('fiscal-periods/:tenantId/:periodId/close')
  closeFiscalPeriod(
    @Param('periodId') periodId: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.expenseService.closeFiscalPeriod(periodId, tenantId);
  }
}
