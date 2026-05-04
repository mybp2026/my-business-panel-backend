export interface DInvoice {
  tenant_customer_id: string | null;
  currency_id: number;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  due_date?: Date | null;
  cash_register_session_id?: string | null;
  points_accumulated?: number;
  ad_message?: string | null;
  amount_paid?: number;
  change_amount?: number;
  invoiced_at: Date;
  updated_at: Date;
  sale_id: string;
}

export interface FullInvoice {
  digital_sale_invoice_id: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  change_amount: number;
  points_accumulated: number;
  ad_message: string | null;
  due_date: string | null;
  invoiced_at: Date | string;
  first_name: string | null;
  last_name: string | null;
  document_number: string | null;
  email: string | null;
  tenant_name: string | null;
}

export interface InvoiceDB {
  tenant_name: string;
  first_name: string;
  last_name: string;
  document_number: string;
  email: string;
  subtotal_amount: number;
  total_amount: number;
  invoiced_at: string | any;
}
