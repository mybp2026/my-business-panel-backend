export interface DInvoice {
  tenant_customer_id: string;
  currency_id: number;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  invoiced_at: Date;
  updated_at: Date;
  sale_id: string;
}

export interface FullInvoice extends DInvoice {
  digital_sale_invoice_id: string;
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
