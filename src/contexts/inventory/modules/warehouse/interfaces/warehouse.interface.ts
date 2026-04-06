export interface Warehouse {
  warehouse_id: string;
  branch_id: string;
  warehouse_name: string;
  warehouse_address: string;
  is_branch: boolean;
  created_at?: Date;
  updated_at?: Date;
}
