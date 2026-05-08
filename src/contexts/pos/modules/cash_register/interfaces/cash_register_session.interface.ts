export interface CashRegisterSession {
  cash_register_session_id: string;
  cash_register_id: string;
  opened_at: string;
  closed_at?: string;
  opening_amount: number;
  closing_amount?: number;
  is_active: boolean;
}
