import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class NewPromoDto {
  @IsUUID()
  tenant_id!: string;

  @IsString()
  promotion_name!: string;

  @IsString()
  promotion_code!: string;

  @IsOptional()
  @IsString()
  promotion_description?: string;

  @IsNumber()
  promotion_type_id!: number;

  @IsNumber()
  customer_segment_id!: number;

  @Type(() => Date)
  @IsDate()
  promotion_start_date!: Date;

  @Type(() => Date)
  @IsDate()
  promotion_end_date!: Date;

  @IsBoolean()
  is_active!: boolean;

  rules!: PromoRules;
}

export interface PromoRules {
  promotion_id?: string;
  discount_percentage?: number;
  discount_amount?: number;
  buy_quantity?: number;
  get_quantity?: number;
  get_discount_percentage?: number;
  min_quantity?: number;
  max_quantity?: number;
  tier_level?: number;
  tier_min_quantity?: number;
  tier_max_quantity?: number;
  tier_price?: number;
  tier_discount_percentage?: number;
  min_purchase_amount?: number;
}