import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE } from '../../../general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { ITransaction } from '@crane-technologies/database/dist/interfaces/ITransaction';
import { accountingQueries } from './accounting.queries';
import {
  SaleJournalParams,
  CogsJournalParams,
  PurchaseJournalParams,
  PaymentJournalParams,
  ExpenseJournalParams,
  PayrollJournalParams,
} from './interface/accounting.interface';

// Account codes from the NIIF PYMES template (Phase 1)
const ACCOUNTS = {
  CAJA_GENERAL: '1-1-001',
  BANCOS: '1-1-002',
  CUENTAS_POR_COBRAR: '1-1-003',
  IVA_CREDITO_FISCAL: '1-1-005',
  INVENTARIO: '1-1-007',
  CUENTAS_POR_PAGAR: '2-1-001',
  IVA_DEBITO_FISCAL: '2-1-003',
  INGRESOS_POR_VENTAS: '4-1-001',
  COSTO_DE_VENTAS: '6-1',
  RETENCIONES_POR_PAGAR: '2-1-004',
  SALARIOS_POR_PAGAR: '2-1-005',
  CARGAS_SOCIALES_POR_PAGAR: '2-1-006',
  SALARIOS_Y_SUELDOS: '5-1-001',
  IVA_CREDITO_FISCAL_GASTO: '1-1-005',
} as const;

@Injectable()
export class AccountingJournalService {
  private readonly logger = new Logger(AccountingJournalService.name);

  // In-memory cache per tenant per transaction (not persisted)
  private accountCache = new Map<string, string>();
  private sourceTypeCache = new Map<string, number>();
  private confirmedStatusId: number | null = null;

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /**
   * Resolves an account_code to its account_id for a given tenant.
   * Uses a per-request cache to avoid repeated lookups within the same call chain.
   */
  private async resolveAccount(
    tenantId: string,
    accountCode: string,
    txn: ITransaction,
  ): Promise<string> {
    const cacheKey = `${tenantId}:${accountCode}`;
    const cached = this.accountCache.get(cacheKey);
    if (cached) return cached;

    const { rows } = await txn.query(accountingQueries.getAccountByCode, [
      tenantId,
      accountCode,
    ]);

    if (!rows.length) {
      throw new Error(
        `Cuenta contable '${accountCode}' no encontrada para tenant ${tenantId}. ` +
          `Ejecute POST /accounting/accounts/provision para crear el plan de cuentas.`,
      );
    }

    const accountId = rows[0].account_id;
    this.accountCache.set(cacheKey, accountId);
    return accountId;
  }

  private async resolveSourceType(
    sourceName: string,
    txn: ITransaction,
  ): Promise<number> {
    const cached = this.sourceTypeCache.get(sourceName);
    if (cached) return cached;

    const { rows } = await txn.query(accountingQueries.getSourceTypeByName, [
      sourceName,
    ]);

    if (!rows.length) {
      throw new Error(`Tipo de fuente '${sourceName}' no encontrado`);
    }

    const id = rows[0].source_type_id;
    this.sourceTypeCache.set(sourceName, id);
    return id;
  }

  private async getConfirmedStatusId(txn: ITransaction): Promise<number> {
    if (this.confirmedStatusId !== null) return this.confirmedStatusId;

    const { rows } = await txn.query(accountingQueries.getConfirmedStatusId);
    if (!rows.length) throw new Error('Status Confirmado no encontrado');
    const id: number = rows[0].status_id;
    this.confirmedStatusId = id;
    return id;
  }

  /**
   * Creates a journal entry with lines, validates balance, and confirms atomically.
   * Must be called within an existing transaction.
   */
  private async createEntry(
    tenantId: string,
    sourceTypeId: number,
    sourceId: string,
    entryDate: Date,
    description: string,
    lines: { accountId: string; debit: number; credit: number; desc: string }[],
    txn: ITransaction,
  ): Promise<string> {
    const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.0001) {
      throw new Error(
        `Asiento desbalanceado: débitos=${totalDebit} créditos=${totalCredit}`,
      );
    }

    const statusId = await this.getConfirmedStatusId(txn);

    const { rows } = await txn.query(accountingQueries.createJournalEntryRaw, [
      tenantId,
      sourceTypeId,
      sourceId,
      entryDate,
      description,
      statusId,
      totalDebit,
      totalCredit,
    ]);
    const entryId = rows[0].entry_id;

    await txn.bulkInsert(
      'accounting_schema.journal_entry_line',
      [
        'entry_id',
        'account_id',
        'debit_amount',
        'credit_amount',
        'description',
      ],
      lines.map((l) => [entryId, l.accountId, l.debit, l.credit, l.desc]),
    );

    return entryId;
  }

  // -------------------------------------------------------
  // PUBLIC METHODS — called by Sale/Purchase services
  // -------------------------------------------------------

  /**
   * Generates the revenue journal entry for a sale.
   *
   * Cash sale (condition '01'):
   *   Debit  Caja General      → total_amount
   *   Credit Ingresos x Venta  → subtotal_amount
   *   Credit IVA Débito Fiscal → tax_amount
   *
   * Credit sale (condition '02'+):
   *   Debit  Cuentas x Cobrar  → total_amount
   *   Credit Ingresos x Venta  → subtotal_amount
   *   Credit IVA Débito Fiscal → tax_amount
   */
  async generateSaleJournal(
    params: SaleJournalParams,
    txn: ITransaction,
  ): Promise<string> {
    const {
      tenantId,
      saleId,
      saleCondition,
      subtotalAmount,
      taxAmount,
      totalAmount,
      entryDate,
    } = params;

    const isCash = saleCondition === '01';
    const sourceName = isCash ? 'SALE_CASH' : 'SALE_CREDIT';

    const [sourceTypeId, debitAccountId, incomeAccountId, ivaAccountId] =
      await Promise.all([
        this.resolveSourceType(sourceName, txn),
        this.resolveAccount(
          tenantId,
          isCash ? ACCOUNTS.CAJA_GENERAL : ACCOUNTS.CUENTAS_POR_COBRAR,
          txn,
        ),
        this.resolveAccount(tenantId, ACCOUNTS.INGRESOS_POR_VENTAS, txn),
        this.resolveAccount(tenantId, ACCOUNTS.IVA_DEBITO_FISCAL, txn),
      ]);

    const lines: {
      accountId: string;
      debit: number;
      credit: number;
      desc: string;
    }[] = [
      {
        accountId: debitAccountId,
        debit: totalAmount,
        credit: 0,
        desc: isCash
          ? 'Cobro de venta al contado'
          : 'Cuenta por cobrar de venta a crédito',
      },
      {
        accountId: incomeAccountId,
        debit: 0,
        credit: subtotalAmount,
        desc: 'Ingreso por venta',
      },
    ];

    if (taxAmount > 0) {
      lines.push({
        accountId: ivaAccountId,
        debit: 0,
        credit: taxAmount,
        desc: 'IVA débito fiscal',
      });
    }

    const description = isCash
      ? `Venta al contado - ${saleId}`
      : `Venta a crédito - ${saleId}`;

    return this.createEntry(
      tenantId,
      sourceTypeId,
      saleId,
      entryDate,
      description,
      lines,
      txn,
    );
  }

  /**
   * Generates the Cost of Goods Sold (COGS) journal entry for a sale.
   *
   *   Debit  Costo de Ventas → total_cost
   *   Credit Inventario      → total_cost
   */
  async generateSaleCogsJournal(
    params: CogsJournalParams,
    txn: ITransaction,
  ): Promise<string | null> {
    const { tenantId, saleId, totalCost, entryDate } = params;

    if (totalCost <= 0) {
      this.logger.warn(
        `COGS skipped for sale ${saleId}: totalCost=${totalCost}`,
      );
      return null;
    }

    const [sourceTypeId, cogsAccountId, inventoryAccountId] = await Promise.all(
      [
        this.resolveSourceType('SALE_COGS', txn),
        this.resolveAccount(tenantId, ACCOUNTS.COSTO_DE_VENTAS, txn),
        this.resolveAccount(tenantId, ACCOUNTS.INVENTARIO, txn),
      ],
    );

    return this.createEntry(
      tenantId,
      sourceTypeId,
      saleId,
      entryDate,
      `Costo de venta - ${saleId}`,
      [
        {
          accountId: cogsAccountId,
          debit: totalCost,
          credit: 0,
          desc: 'Costo de mercadería vendida',
        },
        {
          accountId: inventoryAccountId,
          debit: 0,
          credit: totalCost,
          desc: 'Salida de inventario por venta',
        },
      ],
      txn,
    );
  }

  /**
   * Generates the journal entry when a purchase order is delivered.
   *
   *   Debit  Inventario         → subtotal_amount
   *   Debit  IVA Crédito Fiscal → tax_amount
   *   Credit CxP Proveedores    → total_amount
   */
  async generatePurchaseJournal(
    params: PurchaseJournalParams,
    txn: ITransaction,
  ): Promise<string> {
    const {
      tenantId,
      purchaseOrderId,
      subtotalAmount,
      taxAmount,
      totalAmount,
      entryDate,
    } = params;

    const [
      sourceTypeId,
      inventoryAccountId,
      ivaCreditAccountId,
      payableAccountId,
    ] = await Promise.all([
      this.resolveSourceType('PURCHASE', txn),
      this.resolveAccount(tenantId, ACCOUNTS.INVENTARIO, txn),
      this.resolveAccount(tenantId, ACCOUNTS.IVA_CREDITO_FISCAL, txn),
      this.resolveAccount(tenantId, ACCOUNTS.CUENTAS_POR_PAGAR, txn),
    ]);

    const lines: {
      accountId: string;
      debit: number;
      credit: number;
      desc: string;
    }[] = [
      {
        accountId: inventoryAccountId,
        debit: subtotalAmount,
        credit: 0,
        desc: 'Ingreso de inventario por compra',
      },
    ];

    if (taxAmount > 0) {
      lines.push({
        accountId: ivaCreditAccountId,
        debit: taxAmount,
        credit: 0,
        desc: 'IVA crédito fiscal por compra',
      });
    }

    lines.push({
      accountId: payableAccountId,
      debit: 0,
      credit: totalAmount,
      desc: 'Cuenta por pagar a proveedor',
    });

    return this.createEntry(
      tenantId,
      sourceTypeId,
      purchaseOrderId,
      entryDate,
      `Compra recibida - OC ${purchaseOrderId}`,
      lines,
      txn,
    );
  }

  /**
   * Generates journal entry when a customer payment is received.
   *
   *   Debit  Bancos             → amount
   *   Credit Cuentas por Cobrar → amount
   */
  async generatePaymentReceivedJournal(
    params: PaymentJournalParams,
    txn: ITransaction,
  ): Promise<string> {
    const { tenantId, sourceId, amount, entryDate, description } = params;

    const [sourceTypeId, bankAccountId, receivableAccountId] =
      await Promise.all([
        this.resolveSourceType('PAYMENT_RECEIVED', txn),
        this.resolveAccount(tenantId, ACCOUNTS.BANCOS, txn),
        this.resolveAccount(tenantId, ACCOUNTS.CUENTAS_POR_COBRAR, txn),
      ]);

    return this.createEntry(
      tenantId,
      sourceTypeId,
      sourceId,
      entryDate,
      description ?? `Pago de cliente recibido - ${sourceId}`,
      [
        {
          accountId: bankAccountId,
          debit: amount,
          credit: 0,
          desc: 'Ingreso a bancos',
        },
        {
          accountId: receivableAccountId,
          debit: 0,
          credit: amount,
          desc: 'Liquidación cuenta por cobrar',
        },
      ],
      txn,
    );
  }

  /**
   * Generates journal entry when a payment to a supplier is made.
   *
   *   Debit  CxP Proveedores → amount
   *   Credit Bancos           → amount
   */
  async generatePaymentMadeJournal(
    params: PaymentJournalParams,
    txn: ITransaction,
  ): Promise<string> {
    const { tenantId, sourceId, amount, entryDate, description } = params;

    const [sourceTypeId, payableAccountId, bankAccountId] = await Promise.all([
      this.resolveSourceType('PAYMENT_MADE', txn),
      this.resolveAccount(tenantId, ACCOUNTS.CUENTAS_POR_PAGAR, txn),
      this.resolveAccount(tenantId, ACCOUNTS.BANCOS, txn),
    ]);

    return this.createEntry(
      tenantId,
      sourceTypeId,
      sourceId,
      entryDate,
      description ?? `Pago a proveedor - ${sourceId}`,
      [
        {
          accountId: payableAccountId,
          debit: amount,
          credit: 0,
          desc: 'Liquidación cuenta por pagar',
        },
        {
          accountId: bankAccountId,
          debit: 0,
          credit: amount,
          desc: 'Salida de bancos',
        },
      ],
      txn,
    );
  }

  /**
   * Generates the journal entry for an operational expense.
   *
   * Payment by CASH:
   *   Debit  [Expense Account]     → subtotal_amount
   *   Debit  IVA Crédito Fiscal    → tax_amount (if > 0)
   *   Credit Caja General          → total_amount
   *
   * Payment by BANK/TRANSFER/CHECK:
   *   Debit  [Expense Account]     → subtotal_amount
   *   Debit  IVA Crédito Fiscal    → tax_amount (if > 0)
   *   Credit Bancos                → total_amount
   *
   * Payment by CREDIT_CARD:
   *   Debit  [Expense Account]     → subtotal_amount
   *   Debit  IVA Crédito Fiscal    → tax_amount (if > 0)
   *   Credit Cuentas por Pagar     → total_amount
   */
  async generateExpenseJournal(
    params: ExpenseJournalParams,
    txn: ITransaction,
  ): Promise<string> {
    const {
      tenantId,
      expenseId,
      accountCode,
      subtotalAmount,
      taxAmount,
      totalAmount,
      paymentMethod,
      entryDate,
      description,
    } = params;

    // Determine credit account based on payment method
    let creditAccountCode: string;
    switch (paymentMethod) {
      case 'CASH':
        creditAccountCode = ACCOUNTS.CAJA_GENERAL;
        break;
      case 'CREDIT_CARD':
        creditAccountCode = ACCOUNTS.CUENTAS_POR_PAGAR;
        break;
      default: // BANK, TRANSFER, CHECK
        creditAccountCode = ACCOUNTS.BANCOS;
        break;
    }

    const [sourceTypeId, expenseAccountId, creditAccountId, ivaAccountId] =
      await Promise.all([
        this.resolveSourceType('EXPENSE', txn),
        this.resolveAccount(tenantId, accountCode, txn),
        this.resolveAccount(tenantId, creditAccountCode, txn),
        this.resolveAccount(tenantId, ACCOUNTS.IVA_CREDITO_FISCAL, txn),
      ]);

    const lines: {
      accountId: string;
      debit: number;
      credit: number;
      desc: string;
    }[] = [
      {
        accountId: expenseAccountId,
        debit: subtotalAmount,
        credit: 0,
        desc: `Gasto operativo - ${description ?? accountCode}`,
      },
    ];

    if (taxAmount > 0) {
      lines.push({
        accountId: ivaAccountId,
        debit: taxAmount,
        credit: 0,
        desc: 'IVA crédito fiscal por gasto',
      });
    }

    lines.push({
      accountId: creditAccountId,
      debit: 0,
      credit: totalAmount,
      desc: `Pago de gasto (${paymentMethod})`,
    });

    return this.createEntry(
      tenantId,
      sourceTypeId,
      expenseId,
      entryDate,
      `Gasto operativo - ${description ?? expenseId}`,
      lines,
      txn,
    );
  }

  /**
   * Generates the journal entry when a payroll is closed.
   *
   *   Debit  5-1-001 Salarios y Sueldos    → total_earnings
   *   Credit 2-1-005 Salarios por Pagar    → net_total
   *   Credit 2-1-004 Retenciones por Pagar → total_deductions
   */
  async generatePayrollJournal(
    params: PayrollJournalParams,
    txn: ITransaction,
  ): Promise<string> {
    const {
      tenantId,
      paysheetId,
      totalEarnings,
      totalDeductions,
      netTotal,
      entryDate,
    } = params;

    const [sourceTypeId, salaryExpenseId, salaryPayableId, retentionPayableId] =
      await Promise.all([
        this.resolveSourceType('PAYROLL', txn),
        this.resolveAccount(tenantId, ACCOUNTS.SALARIOS_Y_SUELDOS, txn),
        this.resolveAccount(tenantId, ACCOUNTS.SALARIOS_POR_PAGAR, txn),
        this.resolveAccount(tenantId, ACCOUNTS.RETENCIONES_POR_PAGAR, txn),
      ]);

    const lines: {
      accountId: string;
      debit: number;
      credit: number;
      desc: string;
    }[] = [
      {
        accountId: salaryExpenseId,
        debit: totalEarnings,
        credit: 0,
        desc: 'Gasto de nómina - salarios brutos',
      },
      {
        accountId: salaryPayableId,
        debit: 0,
        credit: netTotal,
        desc: 'Salarios netos por pagar',
      },
    ];

    if (totalDeductions > 0) {
      lines.push({
        accountId: retentionPayableId,
        debit: 0,
        credit: totalDeductions,
        desc: 'Retenciones por pagar (deducciones de nómina)',
      });
    }

    return this.createEntry(
      tenantId,
      sourceTypeId,
      paysheetId,
      entryDate,
      `Nómina - Planilla ${paysheetId}`,
      lines,
      txn,
    );
  }
}
