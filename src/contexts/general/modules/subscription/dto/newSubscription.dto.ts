import { IsDateString, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { createSubscriptionDoc } from '@/docs/contexts/general/subscription';

export class NewSubscriptionDto {
  @ApiProperty(createSubscriptionDoc.dto.tenant_id)
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @ApiProperty(createSubscriptionDoc.dto.payment_method_id)
  @IsNumber()
  @IsNotEmpty()
  payment_method_id!: number;

  @ApiProperty(createSubscriptionDoc.dto.payment_amount)
  @IsNumber()
  @IsNotEmpty()
  payment_amount!: number;

  @ApiProperty(createSubscriptionDoc.dto.details)
  @IsString()
  @IsNotEmpty()
  details!: string;

  @ApiProperty(createSubscriptionDoc.dto.plan)
  @IsString()
  @IsNotEmpty()
  stripe_payment_method_id!: string;

  @IsString()
  plan!: string;

  @ApiProperty(createSubscriptionDoc.dto.subscription_type_id)
  @IsNumber()
  subscription_type_id!: number;

  @ApiProperty(createSubscriptionDoc.dto.start_date)
  @IsDateString()
  start_date!: string;

  @ApiProperty(createSubscriptionDoc.dto.end_date)
  @IsDateString()
  end_date!: string;
}
