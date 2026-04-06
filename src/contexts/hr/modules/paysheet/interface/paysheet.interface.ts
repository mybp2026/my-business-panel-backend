export interface Paysheet {
  paysheet_id: string;
  tenant_id: string;
  branch_id: string;
  period_start: string;
  period_end: string;
  payment_date: string;
  total_earnings: number;
  total_deductions: number;
  net_total: number;
  status_id: number;
  created_at: string;
}

export interface PaysheetDetails {
  paysheet_id: string;
  employee_id: string;
  contract_id: string;
  payment_method_id: number;
  gross_salary: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  status: string;
  pay_date: string;
  created_at: string;
}
