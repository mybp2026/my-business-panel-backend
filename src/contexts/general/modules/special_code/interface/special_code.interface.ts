export interface SpecialCode {
  special_code_id: string;
  code: string;
  description: string | null;
  is_used: boolean;
  tenant_id: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpecialCodeListItem extends SpecialCode {
  used_by_tenant_name: string | null;
  created_by_email: string | null;
}
