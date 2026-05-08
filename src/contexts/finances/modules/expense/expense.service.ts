import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE } from '../../../general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { expenseQueries } from './expense.queries';
import {
  CreateExpenseCategoryDto,
  CreateExpenseDto,
  CreateFiscalPeriodDto,
  UpdateExpenseCategoryDto,
} from './dto/expense.dto';
import {
  ExpenseCategoryFromDb,
  ExpenseFromDb,
  FiscalPeriodFromDb,
} from './interface/expense.interface';
import { AccountingJournalService } from '../accounting/accounting-journal.service';

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly journalService: AccountingJournalService,
  ) {}

  // -------------------------------------------------------
  // EXPENSE CATEGORIES
  // -------------------------------------------------------

  async getCategoriesByTenant(
    tenantId: string,
  ): Promise<ExpenseCategoryFromDb[]> {
    const { rows } = await this.db.query(expenseQueries.getCategoriesByTenant, [
      tenantId,
    ]);
    return rows;
  }

  async getCategoryById(
    categoryId: string,
    tenantId: string,
  ): Promise<ExpenseCategoryFromDb> {
    const { rows } = await this.db.query(expenseQueries.getCategoryById, [
      categoryId,
      tenantId,
    ]);
    if (!rows.length) throw new NotFoundException('Categoría no encontrada');
    return rows[0];
  }

  async createCategory(data: CreateExpenseCategoryDto): Promise<string> {
    const { rows } = await this.db.query(expenseQueries.createCategory, [
      data.tenant_id,
      data.name,
      data.account_code,
      data.parent_category_id ?? null,
      data.is_fixed ?? true,
    ]);
    return rows[0].category_id;
  }

  async updateCategory(
    categoryId: string,
    tenantId: string,
    data: UpdateExpenseCategoryDto,
  ): Promise<string> {
    const { rows } = await this.db.query(expenseQueries.updateCategory, [
      categoryId,
      tenantId,
      data.name ?? null,
      data.account_code ?? null,
      data.is_fixed ?? null,
      data.is_active ?? null,
    ]);
    if (!rows.length) throw new NotFoundException('Categoría no encontrada');
    return rows[0].category_id;
  }

  async provisionCategories(tenantId: string): Promise<number> {
    const { rows } = await this.db.query(
      expenseQueries.provisionTenantExpenseCategories,
      [tenantId],
    );
    return rows.length;
  }

  // -------------------------------------------------------
  // EXPENSES
  // -------------------------------------------------------

  async getExpensesByTenant(tenantId: string): Promise<ExpenseFromDb[]> {
    const { rows } = await this.db.query(expenseQueries.getExpensesByTenant, [
      tenantId,
    ]);
    return rows;
  }

  async getExpensesByBranch(
    tenantId: string,
    branchId: string,
  ): Promise<ExpenseFromDb[]> {
    const { rows } = await this.db.query(expenseQueries.getExpensesByBranch, [
      tenantId,
      branchId,
    ]);
    return rows;
  }

  async getExpenseById(
    expenseId: string,
    tenantId: string,
  ): Promise<ExpenseFromDb> {
    const { rows } = await this.db.query(expenseQueries.getExpenseById, [
      expenseId,
      tenantId,
    ]);
    if (!rows.length) throw new NotFoundException('Gasto no encontrado');
    return rows[0];
  }

  async getExpensesByDateRange(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<ExpenseFromDb[]> {
    const { rows } = await this.db.query(
      expenseQueries.getExpensesByDateRange,
      [tenantId, startDate, endDate],
    );
    return rows;
  }

  async createExpense(
    data: CreateExpenseDto,
  ): Promise<{ expenseId: string; entryId?: string }> {
    const category = await this.getCategoryById(
      data.category_id,
      data.tenant_id,
    );

    const txn = await this.db.transaction();
    try {
      const { rows } = await txn.query(expenseQueries.createExpense, [
        data.tenant_id,
        data.branch_id,
        data.category_id,
        data.description ?? null,
        data.amount,
        data.tax_amount ?? 0,
        data.total_amount,
        data.currency_id,
        new Date(data.expense_date),
        data.payment_method ?? 'CASH',
        data.reference_number ?? null,
        data.notes ?? null,
        data.created_by ?? null,
      ]);
      const expenseId = rows[0].expense_id;

      let entryId: string | undefined;
      try {
        entryId = await this.journalService.generateExpenseJournal(
          {
            tenantId: data.tenant_id,
            expenseId,
            accountCode: category.account_code,
            subtotalAmount: data.amount,
            taxAmount: data.tax_amount ?? 0,
            totalAmount: data.total_amount,
            paymentMethod: data.payment_method ?? 'CASH',
            entryDate: new Date(data.expense_date),
            description: data.description,
          },
          txn,
        );
      } catch (journalError) {
        this.logger.error(
          `Error generating journal for expense ${expenseId}: ${(journalError as Error).message}`,
        );
      }

      await txn.commit();
      return { expenseId, entryId };
    } catch (error) {
      await txn.rollback();
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Error creating expense:', error);
      throw new BadRequestException('Error al registrar el gasto');
    }
  }

  // -------------------------------------------------------
  // FISCAL PERIODS
  // -------------------------------------------------------

  async getFiscalPeriods(tenantId: string): Promise<FiscalPeriodFromDb[]> {
    const { rows } = await this.db.query(
      expenseQueries.getFiscalPeriodsByTenant,
      [tenantId],
    );
    return rows;
  }

  async createFiscalPeriod(data: CreateFiscalPeriodDto): Promise<string> {
    const { rows } = await this.db.query(expenseQueries.createFiscalPeriod, [
      data.tenant_id,
      data.name,
      new Date(data.start_date),
      new Date(data.end_date),
    ]);
    return rows[0].period_id;
  }

  async closeFiscalPeriod(periodId: string, tenantId: string): Promise<string> {
    const { rows } = await this.db.query(expenseQueries.closeFiscalPeriod, [
      periodId,
      tenantId,
    ]);
    if (!rows.length)
      throw new BadRequestException('Período no encontrado o ya está cerrado');
    return rows[0].period_id;
  }
}
