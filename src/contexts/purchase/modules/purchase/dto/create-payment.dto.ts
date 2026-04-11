import { Type } from 'class-transformer';
import { IsUUID, IsNumber, Min, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  purchase_account_payable_id!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount_paid!: number;

  @Type(() => Number)
  @IsInt()
  payment_method_id!: number;

  @IsOptional()
  @IsString()
  payment_reference?: string;
}