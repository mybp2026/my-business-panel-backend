import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { posQueries } from '@pos/pos.queries';
import Database from '@crane-technologies/database';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import { CreateCashRegisterDto } from '@/contexts/pos/modules/cash_register/dto/create_cash_register.dto';
import { UpdateCashRegisterDto } from '@/contexts/pos/modules/cash_register/dto/update_cash_register.dto';
import { StartCashRegisterSessionDto } from '@/contexts/pos/modules/cash_register/dto/start_cash_register_session.dto';
import { CloseCashRegisterSessionDto } from '@/contexts/pos/modules/cash_register/dto/close_cash_register_session.dto';
import { InvalidCashRegisterError } from '@/common/errors/invalid_cash_register.error';
import { CashRegister } from '@/contexts/pos/modules/cash_register/interfaces/cash_register.interface';
import { CashRegisterSession } from '@/contexts/pos/modules/cash_register/interfaces/cash_register_session.interface';
import { InvalidCashRegisterSessionError } from '@/common/errors/invalid_cash_register_session.error';
import { RegisterTransactionDto } from './dto/register_transaction.dto';
import { BranchService } from '@/contexts/general/modules/branch/branch.service';
import { StateService } from '@/contexts/general/modules/state/state.service';

const { cashRegister } = posQueries;

const ADMIN_ROLE_NAMES = new Set(['admin', 'superuser']);

@Injectable()
export class CashRegisterService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly branchService: BranchService,
    private readonly stateService: StateService,
  ) {}

  private isAdmin(session: IUserSession): boolean {
    try {
      const role = this.stateService.getRole(session.role_id);
      return ADMIN_ROLE_NAMES.has(role.role_name);
    } catch {
      return false;
    }
  }

  /**
   * Validates the supplied key against the configured one for a register.
   * No-op for admin sessions and for registers without a configured key.
   */
  private async assertKeyMatches(
    session: IUserSession,
    cashRegisterId: string,
    suppliedKey: string | undefined,
  ): Promise<void> {
    if (this.isAdmin(session)) return;

    const { rows } = await this.db.query(cashRegister.getKey, [cashRegisterId]);
    const configuredKey = rows[0]?.cash_register_key as
      | string
      | null
      | undefined;

    if (!configuredKey) return;
    if (!suppliedKey || suppliedKey !== configuredKey) {
      throw new ForbiddenException(
        'Clave de caja inválida. Solicítala al administrador para continuar.',
      );
    }
  }

  async findAll(): Promise<{ results: CashRegister[] }> {
    const { rows } = await this.db.query(cashRegister.all, []);
    return { results: rows };
  }

  async findAllPaginated(
    branchId?: string,
    isActive?: boolean,
    page = 1,
    limit = 20,
  ): Promise<{
    results: CashRegister[];
    total: number;
    page: number;
    limit: number;
  }> {
    const offset = (page - 1) * limit;
    const branchParam = branchId ?? null;
    const isActiveParam = typeof isActive === 'boolean' ? isActive : null;

    const [dataResult, countResult] = await Promise.all([
      this.db.query(cashRegister.allPaginated, [
        branchParam,
        isActiveParam,
        limit,
        offset,
      ]),
      this.db.query(cashRegister.countPaginated, [branchParam, isActiveParam]),
    ]);

    return {
      results: dataResult.rows,
      total: countResult.rows[0]?.total ?? 0,
      page,
      limit,
    };
  }

  async findById(cash_register_id: string): Promise<{ result: CashRegister }> {
    const { rows } = await this.db.query(cashRegister.byId, [cash_register_id]);
    return { result: rows[0] };
  }

  async findByBranch(branch_id: string): Promise<{ results: CashRegister[] }> {
    // await this.checkBranchId(branch_id);
    const { rows } = await this.db.query(cashRegister.byBranch, [branch_id]);
    return { results: rows };
  }

  async findSessions(
    tenant_id: string,
    branch_id?: string,
    is_active?: boolean,
  ): Promise<{ results: CashRegisterSession[] }> {
    const branchParam = branch_id ?? null;
    const isActiveParam = typeof is_active === 'boolean' ? is_active : null;
    const { rows } = await this.db.query(cashRegister.findSessions, [
      tenant_id,
      branchParam,
      isActiveParam,
    ]);
    return { results: rows };
  }

  async create(tenant_id: string, createDto: CreateCashRegisterDto) {
    const { branch_id, register_name, is_active, cash_register_key } =
      createDto;

    await this.branchService.validateBranch(branch_id, tenant_id);

    const normalisedKey =
      cash_register_key && cash_register_key.trim().length > 0
        ? cash_register_key.trim()
        : null;

    const { rows } = await this.db.query(cashRegister.create, [
      branch_id,
      register_name,
      is_active,
      normalisedKey,
    ]);
    return { created: rows[0] };
  }

  async startSession(
    session: IUserSession,
    startSessionDto: StartCashRegisterSessionDto,
  ) {
    const { cash_register_id, opened_at, opening_amount, cash_register_key } =
      startSessionDto;

    await this.checkId(cash_register_id);
    await this.assertKeyMatches(session, cash_register_id, cash_register_key);

    const { rows } = await this.db.query(cashRegister.startSession, [
      cash_register_id,
      opened_at,
      opening_amount,
      session.user_id,
    ]);

    return { started: rows[0] };
  }

  async closeSession(
    session: IUserSession,
    closeSession: CloseCashRegisterSessionDto,
  ) {
    const { cash_register_session_id, closing_amount, cash_register_key } =
      closeSession;

    const cash_session = await this.getSession(cash_register_session_id);
    if (!cash_session.is_active) throw new InvalidCashRegisterSessionError();

    await this.assertKeyMatches(
      session,
      cash_session.cash_register_id,
      cash_register_key,
    );

    const { rows } = await this.db.query(cashRegister.closeSession, [
      cash_register_session_id,
      closing_amount,
      closeSession.cash_sales_amount ?? 0,
      closeSession.debit_sales_amount ?? 0,
      closeSession.credit_sales_amount ?? 0,
      closeSession.transfer_sales_amount ?? 0,
    ]);

    const closed = rows[0];
    if (closed) {
      closed.payment_method_sales = await this.getSessionPaymentMethodSales(
        cash_register_session_id,
      );
    }

    return { closed };
  }

  async getSessionPaymentMethodSales(cash_register_session_id: string) {
    const { rows } = await this.db.query(
      cashRegister.getSessionPaymentMethodSales,
      [cash_register_session_id],
    );
    return rows;
  }

  async getSessionGroupSales(cash_register_session_id: string) {
    const { rows } = await this.db.query(cashRegister.getSessionGroupSales, [
      cash_register_session_id,
    ]);
    return rows;
  }

  async update(updateDto: UpdateCashRegisterDto) {
    const {
      branch_id,
      cash_register_id,
      register_name,
      is_active,
      cash_register_key,
    } = updateDto;

    const normalisedKey =
      cash_register_key === undefined
        ? null
        : cash_register_key === null || cash_register_key.trim().length === 0
          ? null
          : cash_register_key.trim();

    const { rows } = await this.db.query(cashRegister.update, [
      cash_register_id,
      branch_id,
      register_name,
      is_active,
      normalisedKey,
    ]);
    return { updated: rows[0] };
  }

  async remove(cash_register_id: string) {
    const { rows } = await this.db.query(cashRegister.delete, [
      cash_register_id,
    ]);
    return { deleted: rows[0] };
  }

  async registerTransaction(
    session: IUserSession,
    registerTransactionDto: RegisterTransactionDto,
  ) {
    const { user_id } = session;
    const { cash_register_session_id, amount, transaction_time } =
      registerTransactionDto;

    const cash_session = await this.getSession(cash_register_session_id);
    if (!cash_session.is_active) throw new InvalidCashRegisterSessionError();

    const { rows } = await this.db.query(cashRegister.registerTransaction, [
      cash_register_session_id,
      amount,
      transaction_time,
      user_id,
    ]);

    return { transaction: rows[0] };
  }

  private async checkId(cash_register_id: string): Promise<void> {
    const { rowCount } = await this.db.query(cashRegister.byId, [
      cash_register_id,
    ]);
    if (rowCount === 0)
      throw new InvalidCashRegisterError('Cash register not found');
  }

  private async getSession(session_id: string): Promise<CashRegisterSession> {
    const { rows, rowCount } = await this.db.query(
      cashRegister.getSessionById,
      [session_id],
    );
    if (rowCount === 0) throw new InvalidCashRegisterSessionError();

    const session = rows[0] as CashRegisterSession;
    session.payment_method_sales =
      await this.getSessionPaymentMethodSales(session_id);

    return session;
  }
}
