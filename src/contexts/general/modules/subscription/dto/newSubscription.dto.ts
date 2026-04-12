import { IsDateString, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class NewSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsNumber()
  @IsNotEmpty()
  payment_method_id!: number;

  @IsNumber()
  @IsNotEmpty()
  payment_amount!: number;

  @IsString()
  @IsNotEmpty()
  details!: string;

  @IsString()
  @IsNotEmpty()
  stripe_payment_method_id!: string;

  @IsString()
  plan!: string

  @IsNumber()
  subscription_type_id!: number;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;
}
