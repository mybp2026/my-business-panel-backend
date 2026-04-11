import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class NewLoyalProgramDto {
  @IsUUID()
  tenant_id!: string;

  @IsNumber()
  points_earned_per_currency_unit!: number;

  @IsNumber()
  points_redeemed_per_currency_unit!: number;

  @IsOptional()
  @IsNumber()
  minimum_purchase_for_points?: number;
}
