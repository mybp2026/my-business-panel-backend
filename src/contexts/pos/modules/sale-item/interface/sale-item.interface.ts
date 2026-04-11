export interface Item {
  tenant_id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sale_price_type?: 'NORMAL' | 'PROMO' | 'SEGMENT' | 'MANUAL';
  promotion_id?: string;
  original_price?: number;
  discount_applied?: number;
}

export interface FullItem extends Item {
  sale_item_id: string;
  sale_id: string;
}

export interface ItemFromDb {
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}
