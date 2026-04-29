export interface InventoryItem {
  inventory_id: string;
  tenant_id: string;
  product_variant_id: string;
  warehouse_id: string;
  stock: number;
  expiration_date: string | null;
  variant_name: string;
  sku: string | null;
  product_id: string;
  product_name: string;
  created_at: string;
  updated_at: string;
}
