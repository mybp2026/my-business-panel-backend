import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PayrollRepository } from '../repositories/payroll.repository';
import { CalculationEngine } from './calc-engine.service';
import { AccountingJournalService } from '@/contexts/finances/modules/accounting/accounting-journal.service';
import { hrQueries } from '@hr/hr.queries';
import { CreatePaysheetDto } from '../dto/create-paysheet.dto';
import {
  EmployeePayrollData,
  HoursWorked,
  Incapacities,
  PayrollConceptRow,
} from '../interface/payroll-db.interface';
import Decimal from 'decimal.js';

const { payroll } = hrQueries;

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly repo: PayrollRepository,
    private readonly engine: CalculationEngine,
    private readonly journalService: AccountingJournalService,
  ) {}

  async processPayrollForEmployee(
    paysheetId: string,
    branchId: string,
    tenantId: string,
    periodStart: string,
    periodEnd: string,
  ) {
    console.log('Starting payroll processing for paysheet:', paysheetId);

    const concepts = await this.repo.getConceptsPerTenant(tenantId);
    const incomes = concepts.filter((c) => c.type === 'earning');
    const deductions = concepts.filter((c) => c.type === 'deduction');

    const incapacities = await this.repo.getIncapacities(
      branchId,
      periodStart,
      periodEnd,
    );

    const suspentions = await this.repo.getSuspentionInPeriod(
      periodStart,
      periodEnd,
    );

    console.log('suspention: ', suspentions);

    const suspentionMap = new Map<
      string,
      { suspention_start: string; suspention_end: string }
    >(
      suspentions.map((s) => [
        s.employee_id,
        {
          suspention_start: s.suspention_start,
          suspention_end: s.suspention_end,
        },
      ]),
    );

    const holidays = await this.repo.getHolidays();

    const employees = await this.repo.getEmployeeContractForPayroll(
      tenantId,
      branchId,
    );

    const hoursWorked = await this.repo.getHoursWorked(
      branchId,
      periodStart,
      periodEnd,
    );

    const yearly = await this.repo.getYearlySalary(branchId);

    console.log('Yearly: ', yearly);

    const historicalEarnings = await this.repo.getHistoricalEarnings(branchId);

    const hoursMap = new Map<string, { total: number; work_date: string }[]>();

    hoursWorked.forEach((hw) => {
      const current = hoursMap.get(hw.employee_id) || [];
      current.push({ total: Number(hw.total_hours), work_date: hw.work_date });
      hoursMap.set(hw.employee_id, current);
    });

    const yearlyMap = new Map<string, number>(
      yearly.map((y) => [y.employee_id, y.total]),
    );

    const historicalEarningsMap = new Map<string, number>(
      historicalEarnings.map((h) => [h.employee_id, h.gross]),
    );

    for (const emp of employees) {
      const empHours = hoursMap.get(emp.employee_id) || [];
      const empEarn = historicalEarningsMap.get(emp.employee_id) || 0;
      const empYearly = yearlyMap.get(emp.employee_id) || 0;
      const empSuspentions = suspentionMap.get(emp.employee_id) || {
        suspention_start: '',
        suspention_end: '',
      };

      const susDiscount = this.calculateSuspentionDiscount(
        empSuspentions.suspention_start,
        empSuspentions.suspention_end,
        periodStart,
        periodEnd,
        new Decimal(emp.base_salary),
      );

      await this.calculateAndSavePayroll(
        emp,
        incomes,
        deductions,
        paysheetId,
        empHours,
        empEarn,
        empYearly,
        holidays,
        incapacities,
        susDiscount,
      );
    }

    return this.closePayroll(paysheetId, employees.length);
  }

  private async calculateAndSavePayroll(
    emp: EmployeePayrollData,
    incomeConcepts: PayrollConceptRow[],
    deductionConcepts: PayrollConceptRow[],
    paysheetId: string,
    hours: { total: number; work_date: string }[],
    earning50week: number,
    yearlySalary: number,
    dates: string[],
    incapacities: Incapacities[],
    discount: number | 0,
  ) {
    const incapacityInfo = incapacities.find(
      (i) => i.employee_id === emp.employee_id,
    );
    const time = this.getOvertimeHolidays(hours, dates, emp.turn_type, []);

    const salaryWithDiscount = new Decimal(emp.base_salary).minus(
      new Decimal(discount),
    );

    console.log('calculating income for base salary: ', salaryWithDiscount);
    const incomeResult = this.engine.execute(
      salaryWithDiscount.toString(),
      incomeConcepts,
      {
        standardHours: time.ordinaryHours,
        holidaysHours: time.holidaysHours,
        totalEarnings: earning50week,
        yearlySalary,
        turnType: emp.turn_type,
        incapacityDays: incapacityInfo ? incapacityInfo.days_paying : 0,
        incapacityPercentage: incapacityInfo
          ? incapacityInfo.percentage_to_pay
          : 0,
        percentage: incapacityInfo ? incapacityInfo.percentage_to_pay : 0,
      },
    );

    console.log(
      'taxable gross after income calculation:',
      incomeResult.totals.taxableBase,
    );
    const currentGrossSalary = incomeResult.totals.taxableBase;

    const deductionResult = this.engine.execute(
      emp.base_salary,
      deductionConcepts,
      {
        gross: new Decimal(currentGrossSalary),
      },
    );

    const allMovements = [
      ...incomeResult.movements,
      ...deductionResult.movements,
    ];
    const netSalary = new Decimal(incomeResult.totals.earnings).minus(
      new Decimal(deductionResult.totals.deductions),
    );

    const allTotals = {
      grossSalary: incomeResult.totals.grossSalary,
      earnings: incomeResult.totals.earnings,
      deductions: deductionResult.totals.deductions,
      netSalary: netSalary.plus(emp.base_salary),
    };
    console.log(
      'Payroll calculation result for employee:',
      emp.employee_id,
      allTotals,
    );

    const txn = await this.db.transaction();
    try {
      const { rows } = await txn.query(payroll.insertDetail, [
        paysheetId,
        emp.employee_id,
        emp.contract_id,
        1, // payment_method_id hardcoded for now
        allTotals.grossSalary,
        allTotals.earnings,
        allTotals.deductions,
        allTotals.netSalary.toString(),
        new Date(),
      ]);
      const detailId = rows[0].detail_id;

      for (const mov of allMovements) {
        await txn.query(payroll.insertMovement, [
          detailId,
          mov.concept_id,
          mov.calculated_amount.toString(),
          mov.appliedValue.toString(),
          mov.name,
        ]);
      }

      await txn.commit();
    } catch (error) {
      await txn.rollback();
      console.error('Error processing payroll transaction:', error);
      throw new Error(
        'Failed to process payroll for employee ' + emp.employee_id,
      );
    }
  }

  async createPaysheetHeader(data: CreatePaysheetDto) {
    // const exist = await this.db.query(payroll.checkExistingPeriod, [
    //   data.branchId,
    //   data.tenantId,
    //   data.periodStart,
    //   data.periodEnd,
    // ]);

    // if (exist.rows.length > 0) {
    //   throw new Error(
    //     'Paysheet for the specified period already exists for this branch and tenant.',
    //   );
    // }

    const newPaysheet = await this.db.query(payroll.insertPaysheet, [
      data.tenantId,
      data.branchId,
      data.periodStart,
      data.periodEnd,
    ]);

    return newPaysheet.rows[0];
  }

  async closePayroll(paysheetId: string, expectedEmployeeCount: number) {
    const verify = await this.db.query(payroll.verifyPaysheet, [paysheetId]);
    const actualCount = parseInt(verify.rows[0].total);

    if (actualCount !== expectedEmployeeCount) {
      throw new Error(
        `Paysheet cannot be closed. Expected ${expectedEmployeeCount} employees, but found ${actualCount} processed.`,
      );
    }

    const result = await this.db.query(payroll.closePaysheet, [paysheetId]);

    if (result.rows.length === 0) {
      throw Error(
        'Paysheey not found or cant be closed. (Maybe theres no details generated)',
      );
    }

    const totals = result.rows[0];

    console.log(
      `Payroll closed for paysheet ${paysheetId} with totals:`,
      totals,
    );

    // Generate payroll journal entry (non-blocking — log errors but don't fail)
    try {
      const txn = await this.db.transaction();
      try {
        await this.journalService.generatePayrollJournal(
          {
            tenantId: totals.tenant_id,
            paysheetId,
            totalEarnings: Number(totals.total_earnings),
            totalDeductions: Number(totals.total_deductions),
            netTotal: Number(totals.net_total),
            entryDate: new Date(),
          },
          txn,
        );
        await txn.commit();
      } catch (txnError) {
        await txn.rollback();
        throw txnError;
      }
    } catch (journalError) {
      this.logger.error(
        `Error generating payroll journal for paysheet ${paysheetId}: ${(journalError as Error).message}`,
      );
    }

    return totals;
  }

  getOvertimeHolidays(
    clockingDates: { total: number; work_date: string }[],
    holidays: string[],
    turn: number,
    incapacities: string[],
  ) {
    let holidaysHours = new Decimal(0);
    let ordinaryHours = new Decimal(0);

    if (holidays.length === 0) {
      return {
        holidaysHours,
        ordinaryHours: new Decimal(
          clockingDates.reduce((acc, d) => acc + d.total, 0),
        ),
      };
    }

    clockingDates.forEach((date) => {
      const formattedDate = new Date(date.work_date)
        .toISOString()
        .split('T')[0];

      const isHoliday = holidays.some((h) => h === formattedDate);

      const extraHours = Decimal.max(
        0,
        new Decimal(date.total).minus(new Decimal(turn)),
      );

      if (isHoliday) {
        holidaysHours = holidaysHours.plus(extraHours);
      } else {
        ordinaryHours = ordinaryHours.plus(extraHours);
      }
    });

    console.log('Overtime and holiday hours calculated:', {
      holidaysHours: holidaysHours.toFixed(2),
      ordinaryHours: ordinaryHours.toFixed(2),
    });
    return {
      holidaysHours,
      ordinaryHours,
    };
  }

  calculateSuspentionDiscount(
    start: string,
    end: string,
    periodStart: string,
    periodEnd: string,
    base_salary: Decimal,
  ) {
    if (!start || !end || start === '' || end === '') return 0;

    let discount = 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const periodStartDate = new Date(periodStart);
    const periodEndDate = new Date(periodEnd);

    const effectiveStart =
      startDate > periodStartDate ? startDate : periodStartDate;
    const effectiveEnd = endDate < periodEndDate ? endDate : periodEndDate;

    const timeDiff = effectiveEnd.getTime() - effectiveStart.getTime();

    const dayDiff = Math.max(Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1, 0);
    const dailySalary = base_salary.dividedBy(30);

    discount = dailySalary.times(dayDiff).toNumber();
    console.log('Suspention discount calculation: ', {
      start,
      end,
      effectiveStart: effectiveStart.toISOString().split('T')[0],
      effectiveEnd: effectiveEnd.toISOString().split('T')[0],
      dayDiff,
      dailySalary: dailySalary.toFixed(2),
      discount: discount.toFixed(2),
    });
    return discount;
  }
}
