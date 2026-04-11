export interface Employee {
  employee_id: string;
  user_id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  doc_number: string;
  phone: string;
  email: string;
  contract_id: string;
  payment_schedule_id: number;
  is_active: boolean;
}

export interface IEmployee {
  first_name: string;
  last_name: string;
  doc_number: string;
  phone: string;
  email: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  hours: number;
  base_salary: number;
  duties: string;
  turn_id: number;
  branch_id: string;
}

export interface Contract {
  contract_id: string;
  start_date: string;
  end_date: string;
  hours: number;
  base_salary: number;
  duties: string;
}
