export interface EmployeePayrollData {
  employee_id: string;
  tenant_id: string;
  branch_id: string;
  contract_id: string;
  base_salary: string;
  hours: number;
  turn_type: number;
  payment_schedule_id: number;
}

export interface PayrollConceptRow {
  concept_id: number;
  name: string;
  type: 'earning' | 'deduction';
  calculation_method: 'fixed' | 'percentage' | 'formula' | 'manual';
  is_taxable: boolean;
  base_value: string;
  code?: string;
}

export interface HoursWorked {
  employee_id: string;
  work_date: string;
  total_hours: number;
}

export interface HistoricalEarnings {
  employee_id: string;
  gross: number;
}

export interface YearlySalary {
  employee_id: string;
  total: number;
}

export interface Holidays {
  holiday_id: number;
  holiday_date: string;
  holiday_name: string;
  is_freeday: boolean;
  is_payable: boolean;
}

export interface Incapacities {
  employee_id: string;
  type: string;
  period_start: string;
  period_end: string;
  days_paying: number;
  percentage_to_pay: number;
}
