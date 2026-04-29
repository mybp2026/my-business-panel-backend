export interface Payment {
  tenant_customer_id: string;
  sale_id?: string;
  payment_method_id: number;
  is_points_redemption: boolean;
  points_redeemed: number;
  points_to_currency_rate: number;
  payment_amount: number;
  payment_date: string;
  currency_id: number;
  verified: boolean;
}
