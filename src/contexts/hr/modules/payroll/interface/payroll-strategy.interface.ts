import { Decimal } from "decimal.js";

export interface CalculatorInput {
  baseSalary: Decimal;
  conceptValue: Decimal;
  context?: Record<string, Decimal>;
}

export interface IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal;
}