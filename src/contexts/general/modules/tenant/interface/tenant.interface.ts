export interface Tenant {
  tenant_id: string;
  tenant_name: string;
  region_id: number;
  identification: string;
  econ_activity?: string;
  sign?: string;
  contact_email: string;
  is_subscribed: boolean;
  stripe_id: string;
  created_at: string;
  updated_at: string;
}
