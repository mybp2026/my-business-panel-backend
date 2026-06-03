import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Database from '@crane-technologies/database/dist/components/Database';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import { StateService } from '@/contexts/general/modules/state/state.service';
import {
  accountsOverviewQueries,
  apOverviewSelect,
  arGroupByClause,
  arOverviewSelect,
} from './accounts.queries';
import { IUserSession } from '@/common/interfaces/user_session.interface';

interface AccountListQuery {
  status?: string;
  sort_by?: string;
  sort_dir?: string;
}

const SUPERUSER_HIERARCHY = 1;

export interface AlertConfig {
  warning_days_before_due: number;
  urgent_days_before_due: number;
}

const AP_SORT_COLS: Record<string, string> = {
  due_date: 'ap.due_date',
  created_at: 'pap.created_at',
  balance_due: 'balance_due',
};

const AR_SORT_COLS: Record<string, string> = {
  due_date: 'ar.due_date',
  created_at: 'sar.created_at',
  balance_due: 'balance_due',
};

@Injectable()
export class AccountsService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly stateService: StateService,
  ) {}

  async getAccountsOverview(session: IUserSession) {
    const isSuperuser =
      this.stateService.getRole(session.role_id).role_hierarchy ===
      SUPERUSER_HIERARCHY;

    const { ap, ar, alertConfig } = accountsOverviewQueries;

    const [payablesResult, receivablesResult, apConfigResult, arConfigResult] =
      await Promise.all([
        isSuperuser
          ? this.db.query(ap.getGlobal)
          : this.db.query(ap.getByTenant, [session.tenant_id]),
        isSuperuser
          ? this.db.query(ar.getGlobal)
          : this.db.query(ar.getByTenant, [session.tenant_id]),
        session.tenant_id
          ? this.db
              .query(alertConfig.getPayableConfig, [session.tenant_id])
              .catch(() => ({ rows: [] }))
          : Promise.resolve({ rows: [] }),
        session.tenant_id
          ? this.db
              .query(alertConfig.getReceivableConfig, [session.tenant_id])
              .catch(() => ({ rows: [] }))
          : Promise.resolve({ rows: [] }),
      ]);

    const payablesAlertConfig: AlertConfig | null =
      apConfigResult.rows[0] ?? null;
    const receivablesAlertConfig: AlertConfig | null =
      arConfigResult.rows[0] ?? null;

    return {
      payables: payablesResult.rows,
      receivables: receivablesResult.rows,
      payables_alert_config: payablesAlertConfig,
      receivables_alert_config: receivablesAlertConfig,
    };
  }

  async getPayablesList(query: AccountListQuery, session: IUserSession) {
    const isSuperuser =
      this.stateService.getRole(session.role_id).role_hierarchy ===
      SUPERUSER_HIERARCHY;

    const values: unknown[] = [];
    const conditions: string[] = ['ap.is_paid = false'];

    if (!isSuperuser) {
      values.push(session.tenant_id);
      conditions.push(`b.tenant_id = $${values.length}`);
    }

    if (query.status && /^\d+$/.test(query.status)) {
      values.push(parseInt(query.status, 10));
      conditions.push(`pap.account_payable_status = $${values.length}`);
    }

    const sortCol = AP_SORT_COLS[query.sort_by ?? ''] ?? AP_SORT_COLS['due_date'];
    const sortDir = query.sort_dir === 'asc' ? 'ASC' : 'DESC';

    const sql = `
      ${apOverviewSelect}
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${sortCol} ${sortDir}, pap.created_at DESC
    `;

    const result = await this.db.query(sql, values);
    return result.rows;
  }

  async getReceivablesList(query: AccountListQuery, session: IUserSession) {
    const isSuperuser =
      this.stateService.getRole(session.role_id).role_hierarchy ===
      SUPERUSER_HIERARCHY;

    const values: unknown[] = [];
    const conditions: string[] = ['ar.is_paid = false'];

    if (!isSuperuser) {
      values.push(session.tenant_id);
      conditions.push(`ar.tenant_id = $${values.length}`);
    }

    if (query.status && /^\d+$/.test(query.status)) {
      values.push(parseInt(query.status, 10));
      conditions.push(`sar.account_receivable_status = $${values.length}`);
    }

    const sortCol = AR_SORT_COLS[query.sort_by ?? ''] ?? AR_SORT_COLS['due_date'];
    const sortDir = query.sort_dir === 'asc' ? 'ASC' : 'DESC';

    const sql = `
      ${arOverviewSelect}
      WHERE ${conditions.join(' AND ')}
      ${arGroupByClause}
      ORDER BY ${sortCol} ${sortDir}, sar.created_at DESC
    `;

    const result = await this.db.query(sql, values);
    return result.rows;
  }

  async getPayablePayments(
    payableId: string,
    session: IUserSession,
  ) {
    const isSuperuser =
      this.stateService.getRole(session.role_id).role_hierarchy ===
      SUPERUSER_HIERARCHY;

    const { payableDetail } = accountsOverviewQueries;

    const accessResult = await this.db.query(
      payableDetail.getAccess,
      [payableId],
    );

    if (!accessResult.rows[0]) {
      throw new NotFoundException('Cuenta por pagar no encontrada');
    }

    if (
      !isSuperuser &&
      accessResult.rows[0].tenant_id !== session.tenant_id
    ) {
      throw new ForbiddenException('Sin acceso a esta cuenta');
    }

    const result = await this.db.query(payableDetail.getPayments, [payableId]);
    return result.rows;
  }

  async getReceivableCollections(
    receivableId: string,
    session: IUserSession,
  ) {
    const isSuperuser =
      this.stateService.getRole(session.role_id).role_hierarchy ===
      SUPERUSER_HIERARCHY;

    const { receivableDetail } = accountsOverviewQueries;

    const accessResult = await this.db.query(
      receivableDetail.getAccess,
      [receivableId],
    );

    if (!accessResult.rows[0]) {
      throw new NotFoundException('Cuenta por cobrar no encontrada');
    }

    if (
      !isSuperuser &&
      accessResult.rows[0].tenant_id !== session.tenant_id
    ) {
      throw new ForbiddenException('Sin acceso a esta cuenta');
    }

    const result = await this.db.query(
      receivableDetail.getCollections,
      [receivableId],
    );
    return result.rows;
  }
}
