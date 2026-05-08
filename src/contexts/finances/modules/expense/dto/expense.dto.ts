import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateExpenseCategoryDto {
  @IsNotEmpty()
  @IsUUID()
  tenant_id!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  account_code!: string;

  @IsOptional()
  @IsUUID()
  parent_category_id?: string;

  @IsOptional()
  @IsBoolean()
  is_fixed?: boolean;
}

export class UpdateExpenseCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  account_code?: string;

  @IsOptional()
  @IsBoolean()
  is_fixed?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsUUID()
  tenant_id!: string;

  @IsNotEmpty()
  @IsUUID()
  branch_id!: string;

  @IsNotEmpty()
  @IsUUID()
  category_id!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsNumber()
  tax_amount?: number;

  @IsNotEmpty()
  @IsNumber()
  total_amount!: number;

  @IsNotEmpty()
  @IsNumber()
  currency_id!: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  expense_date!: Date;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  reference_number?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  created_by?: string;
}

export class CreateFiscalPeriodDto {
  @IsNotEmpty()
  @IsUUID()
  tenant_id!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  start_date!: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  end_date!: Date;
}
