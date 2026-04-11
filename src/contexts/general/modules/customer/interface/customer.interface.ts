export interface Customer {
  tenant_customer_id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  document_type_id: number;
  document_number: string;
  econ_activity: string;
  email: string;
  phone: string;
  birthdate?: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}