import { Injectable } from '@nestjs/common';
import {
  CalculatorInput,
  IPayrollStrategy,
} from '../interface/payroll-strategy.interface';
import Decimal from 'decimal.js';

@Injectable()
export class PercentageStrategy implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    return input.baseSalary.mul(input.conceptValue);
  }
}
