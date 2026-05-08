export interface CustomerSegmentMargin {
  customer_segment_id: string;
  tenant_name: string;
  segment_name: string;
  type_name: string;
  spending_threshold: number;
  seniority_months: number;
  frequency_per_months: number;
}
