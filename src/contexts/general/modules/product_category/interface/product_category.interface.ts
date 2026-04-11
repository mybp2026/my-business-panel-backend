export interface ProductCategory {
  product_category_id: number;
  category_name: string;
  parent_category_id: number | null;
  hierarchy_level: number;
  created_at: Date;
  updated_at: Date;
}
