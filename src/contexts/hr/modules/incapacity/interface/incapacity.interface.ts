export interface Incapacity {
  incapacity_id: string;
  employee_id: string;
  branch_id: string;
  type: string;
  period_start: string;
  period_end: string;
  days_paying: number;
  percentage_to_pay: number;
}