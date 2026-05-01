export interface Promo {
  promotion_id: string;
  tenant_id?: string;
  promotion_name: string;
  promotion_code: string;
  promotion_description?: string;
  promotion_type_id?: number;
  customer_segment_id?: number;
  segment_name: string;
  promotion_start_date: string;
  promotion_end_date: string;
  type_name: string;
  is_active: boolean;
  is_default?: boolean;
  is_stackable?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PromoRule {
  promotion_rule_id: string;
  promotion_id: string;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  buy_quantity?: number | null;
  get_quantity?: number | null;
  get_discount_percentage?: number | null;
  min_quantity?: number | null;
  max_quantity?: number | null;
  tier_level?: number | null;
  tier_min_quantity?: number | null;
  tier_max_quantity?: number | null;
  tier_price?: number | null;
  tier_discount_percentage?: number | null;
  min_purchase_amount?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PromotionTargetRow {
  promotion_target_id?: string;
  promotion_id?: string;
  tenant_id?: string;
  target_type: 'VARIANT' | 'GROUP';
  target_product_variant_id?: string | null;
  target_group_id?: string | null;
  variant_sku?: string | null;
  variant_name?: string | null;
  group_name?: string | null;
  type_name?: string | null;
}

export interface PromoWithRule extends Promo {
  rule?: PromoRule;
  rules: PromoRule[];
  targets?: PromotionTargetRow[];
}

export interface PromoType {
  promotion_type_id: number;
  type_name: string;
  created_at: string;
  updated_at: string;
}