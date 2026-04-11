export interface Promo {
  promotion_name: string;
  promotion_code: string;
  promotion_description?: string;
  segment_name: string;
  promotion_start_date: string;
  promotion_end_date: string;
  type_name: string;
  is_active: boolean;
}

export interface PromoType {
  promotion_type_id: number;
  type_name: string;
  created_at: string;
  updated_at: string;
}