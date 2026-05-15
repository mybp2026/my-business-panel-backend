export interface SessionPaymentMethodSale {
  payment_method_id: number;
  payment_method_name: string;
  total_amount: number;
}

export interface CashRegisterSession {
  cash_register_session_id: string;
  cash_register_id: string;
  opened_at: string;
  closed_at?: string;
  opening_amount: number;
  closing_amount?: number;
  is_active: boolean;
  payment_method_sales?: SessionPaymentMethodSale[];

  // Legacy fields
  cash_sales_amount?: number;
  debit_sales_amount?: number;
  credit_sales_amount?: number;
  transfer_sales_amount?: number;
  points_sales_amount?: number;
  total_sales_amount?: number;
  mismatch?: boolean;
  mismatch_amount?: number;
  mismatch_type?: 'surplus' | 'shortage';
  register_name?: string;
  branch_name?: string;
  user_first_name?: string;
  user_last_name?: string;
}
