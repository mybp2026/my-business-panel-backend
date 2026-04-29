export interface IEmployeeResult {
  employee_id: number;
  first_name: string;
  last_name: string;
  doc_number: string;
  phone: string;
  employee_email: string;
  is_active: boolean;
  payment_schedule_id: number;
  branch_id: string;
  contract_id: number;
  start_date: string;
  end_date: string | null;
  hours: number;
  base_salary: number;
  duties: string;
  turn_type: number;
  turn_id: number | null;
}

export interface IUserResult {
  tenant_id: string;
  user_id: string;
  email: string;
  password_hash?: string;
  role_id: number;
  created_at?: string;
  updated_at?: string;
  employee?: IEmployeeResult | null;
}
