import Decimal from 'decimal.js';
import {
  CalculatorInput,
  IPayrollStrategy,
} from '../interface/payroll-strategy.interface';

export class OvertimeStrategy implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    const base_salary = input.baseSalary;

    const multiplier = new Decimal(input.conceptValue || 1.5);
    const isHolidayConcept = multiplier.equals(2.0);

    const hours = isHolidayConcept
      ? input.context?.holidaysHours || new Decimal(0)
      : input.context?.standardHours || new Decimal(0);
    const hoursWorked = new Decimal(hours);

    console.log('Horas Trabajadas', hoursWorked);

    const turnType = new Decimal(input.context?.turnType || 8);

    const dailyRate = base_salary.dividedBy(new Decimal(30));
    const hourlyRate = dailyRate.dividedBy(turnType);

    if (hoursWorked.isNegative() || hoursWorked.isZero()) {
      return new Decimal(0);
    }

    const pay = hoursWorked.mul(hourlyRate).mul(multiplier);
    console.log('Overtime calculation details:', {
      base_salary: base_salary.toFixed(2),
      hoursWorked: hoursWorked.toFixed(2),
      turnType: turnType.toFixed(2),
      dailyRate: dailyRate.toFixed(2),
      hourlyRate: hourlyRate.toFixed(2),
      multiplier: multiplier.toFixed(2),
      pay: pay.toFixed(2),
    });

    return pay.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }
}

export class VacationsStrategy implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    const earnings50week = new Decimal(input.context?.totalEarnings || 0);
    const constantDivisive = new Decimal(input.conceptValue);

    if (earnings50week.isZero()) {
      return new Decimal(0);
    }

    const vacationsPay = earnings50week.dividedBy(constantDivisive);

    console.log('Vacations calculation details:', {
      earnings50week: earnings50week.toFixed(2),
      constantDivisive: constantDivisive.toFixed(2),
      vacationsPay: vacationsPay.toFixed(2),
    });

    return vacationsPay.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }
}

export class HolidayStrategy implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    const totalYear = new Decimal(input.context?.yearlySalary || 0);
    const factor = new Decimal(input.conceptValue);

    if (totalYear.isZero()) {
      return new Decimal(0);
    }

    const holidayPay = totalYear.dividedBy(factor);

    console.log('Holiday calculation details:', {
      holidayPay: holidayPay.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    });

    return holidayPay.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }
}

export class ISRDeduction implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    console.log(input.context?.gross);
    const currentGross = input.context?.gross || new Decimal(0);
    let val: Decimal;

    if (input.context?.has_ccss) {
      const gross = currentGross.mul(new Decimal(0.1083));
      val = currentGross.minus(gross);
    } else {
      val = currentGross;
    } 

    const brackets = [
      { upTo: new Decimal(929000), taxApply: new Decimal(0) },
      { upTo: new Decimal(1363000), taxApply: new Decimal(0.1) },
      { upTo: new Decimal(2392000), taxApply: new Decimal(0.15) },
      { upTo: new Decimal(4783000), taxApply: new Decimal(0.2) },
      { upTo: null, taxApply: new Decimal(0.25) },
    ];

    let totalTax = new Decimal(0);
    let previousLimit = new Decimal(0);

    for (const b of brackets) {
      if (val.gt(previousLimit)) {
        const upperLimit = b.upTo ? b.upTo : val;

        const bracketTax = Decimal.min(val, upperLimit).minus(previousLimit);

        if (bracketTax.gt(0)) {
          totalTax = totalTax.plus(bracketTax.mul(b.taxApply));
        }

        previousLimit = upperLimit;
      } else {
        break;
      }
    }

    console.log('Tax total: ', totalTax);
    return totalTax.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }
}

export class IncapacityStrategy implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    const base = input.baseSalary;
    const dailyRate = base.dividedBy(new Decimal(30));
    const days = new Decimal(input.context?.incapacityDays || 0);
    const percentage = new Decimal(input.context?.percentage || 0);

    if (!days || days.isZero()) return new Decimal(0);

    const incapacityPayment = dailyRate
      .mul(percentage.dividedBy(new Decimal(100)))
      .mul(days);

    console.log('Incapacity calculation details:', {
      base: base.toFixed(2),
      dailyRate: dailyRate.toFixed(2),
      days: days.toFixed(2),
      percentage: percentage.toFixed(2),
      incapacityPayment: incapacityPayment.toFixed(2),
    });

    return incapacityPayment.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }
}

export class IncapacityDeductionStrategy implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    const base = input.baseSalary;
    const dailyRate = base.dividedBy(new Decimal(30));
    const days = new Decimal(input.context?.incapacityDays || 0);

    if (!days || days.isZero()) return new Decimal(0);

    const incapacityDeduction = dailyRate.mul(days);

    console.log('Incapacity Deduction calculation details:', {
      base: base.toFixed(2),
      dailyRate: dailyRate.toFixed(2),
      days: days.toFixed(2),
      incapacityDeduction: incapacityDeduction.toFixed(2),
    });

    return incapacityDeduction
      .mul(new Decimal(-1))
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }
}
