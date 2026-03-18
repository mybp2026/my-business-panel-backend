import { Payment } from '@/modules/customer_payment/interface/payments.interface';
import { Item } from '@/modules/sale-item/interface/sale-item.interface';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class NewSingleSaleDto {
  @IsNotEmpty()
  @IsUUID()
  branch_id!: string;

  @IsNotEmpty()
  @IsUUID()
  tenant_customer_id!: string;

  @IsNotEmpty()
  @IsString()
  sale_condition!: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  sale_date!: Date;

  @IsNotEmpty()
  @IsNumber()
  currency_id!: number;

  @IsNotEmpty()
  @IsNumber()
  subtotal_amount!: number;

  @IsNotEmpty()
  @IsNumber()
  tax_amount!: number;

  @IsNotEmpty()
  @IsNumber()
  total_amount!: number;

  @IsBoolean()
  is_completed!: boolean;

  @IsOptional()
  @IsBoolean()
  has_electronic_invoice?: boolean;
}

export class FullSaleDto {
  @IsNotEmpty()
  @IsUUID()
  branch_id!: string;

  @IsNotEmpty()
  @IsNumber()
  currency_id!: number;

  @IsNotEmpty()
  @IsUUID()
  tenant_id!: string;

  @IsNotEmpty()
  @IsUUID()
  tenant_customer_id!: string;

  @IsNotEmpty()
  @IsString()
  sale_condition!: string;

  @IsNotEmpty()
  @IsString()
  sale_date!: string;

  @IsNotEmpty()
  @IsNumber()
  total_amount!: number;

  @IsNotEmpty()
  @IsNumber()
  subtotal_amount!: number;

  @IsNotEmpty()
  @IsNumber()
  tax_amount!: number;

  @IsNotEmpty()
  @IsBoolean()
  is_completed!: boolean;

  @IsNotEmpty()
  @IsArray()
  items!: Item[];

  @IsOptional()
  @IsBoolean()
  has_electronic_invoice?: boolean;

  @IsNotEmpty()
  @IsArray()
  payments!: Payment[];
}
