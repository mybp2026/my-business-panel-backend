import { Inject, Injectable } from '@nestjs/common';
import { queries } from '@/queries';
import Database from '@crane-technologies/database';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { DATABASE } from '@/modules/db/db.provider';
import { CreateCashRegisterDto } from '@/modules/cash_register/dto/create_cash_register.dto';
import { UpdateCashRegisterDto } from '@/modules/cash_register/dto/update_cash_register.dto';
import { StartCashRegisterSessionDto } from '@/modules/cash_register/dto/start_cash_register_session.dto';
import { CloseCashRegisterSessionDto } from '@/modules/cash_register/dto/close_cash_register_session.dto';
// import { RegisterTransactionDto } from '@/modules/cash_register/dto/register_transaction.dto';
import { InvalidCashRegisterError } from '@/common/errors/invalid_cash_register.error';
// import { InvalidBranchError } from '@/common/errors/invalid_branch.error';
import { CashRegister } from '@/modules/cash_register/interfaces/cash_register.interface';
import { CashRegisterSession } from '@/modules/cash_register/interfaces/cash_register_session.interface';
import { InvalidCashRegisterSessionError } from '@/common/errors/invalid_cash_register_session.error';
import { RegisterTransactionDto } from './dto/register_transaction.dto';
import { BranchService } from '@/modules/branch/branch.service';

@Injectable()
export class CashRegisterService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly branchService: BranchService,
  ) {}

  async findAll(): Promise<{ results: CashRegister[] }> {
    const { rows } = await this.db.query(queries.cash_register.all, []);
    return { results: rows };
  }

  async findById(cash_register_id: string): Promise<{ result: CashRegister }> {
    const { rows } = await this.db.query(queries.cash_register.byId, [
      cash_register_id,
    ]);
    return { result: rows[0] };
  }

  async findByBranch(branch_id: string): Promise<{ results: CashRegister[] }> {
    // await this.checkBranchId(branch_id);
    const { rows } = await this.db.query(queries.cash_register.byBranch, [
      branch_id,
    ]);
    return { results: rows };
  }

  async create(tenant_id: string, createDto: CreateCashRegisterDto) {
    const { branch_id, register_name, is_active } = createDto;

    await this.branchService.validateBranch(branch_id, tenant_id);

    const { rows } = await this.db.query(queries.cash_register.create, [
      branch_id,
      register_name,
      is_active,
    ]);
    return { created: rows[0] };
  }

  async startSession(
    userId: string,
    startSessionDto: StartCashRegisterSessionDto,
  ) {
    const { cash_register_id, opened_at, opening_amount } = startSessionDto;

    await this.checkId(cash_register_id);

    const { rows } = await this.db.query(queries.cash_register.startSession, [
      cash_register_id,
      opened_at,
      opening_amount,
      userId,
    ]);

    return { started: rows[0] };
  }

  async closeSession(closeSession: CloseCashRegisterSessionDto) {
    const { cash_register_session_id, closed_at, closing_amount } =
      closeSession;

    const cash_session = await this.getSession(cash_register_session_id);
    if (!cash_session.is_active) throw new InvalidCashRegisterSessionError();

    const { rows } = await this.db.query(queries.cash_register.closeSession, [
      closed_at,
      closing_amount,
      cash_register_session_id,
    ]);
    return { closed: rows[0] };
  }

  async update(updateDto: UpdateCashRegisterDto) {
    const { branch_id, cash_register_id, is_active } = updateDto;
    const { rows } = await this.db.query(queries.cash_register.update, [
      cash_register_id,
      branch_id,
      is_active,
    ]);
    return { updated: rows[0] };
  }

  async remove(cash_register_id: string) {
    const { rows } = await this.db.query(queries.cash_register.delete, [
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

    const { rows } = await this.db.query(
      queries.cash_register.registerTransaction,
      [cash_register_session_id, amount, transaction_time, user_id],
    );

    return { transaction: rows[0] };
  }

  private async checkId(cash_register_id: string): Promise<void> {
    const { rowCount } = await this.db.query(queries.cash_register.byId, [
      cash_register_id,
    ]);
    if (rowCount === 0)
      throw new InvalidCashRegisterError('Cash register not found');
  }

  private async getSession(session_id: string): Promise<CashRegisterSession> {
    const { rows, rowCount } = await this.db.query(
      queries.cash_register.getSessionById,
      [session_id],
    );
    if (rowCount === 0)
      throw new InvalidCashRegisterError('Cash register session not found');
    return rows[0];
  }
}
