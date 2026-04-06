import { IsString, IsInt, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MaxLength(20)
  account_code!: string;

  @IsString()
  @MaxLength(150)
  account_name!: string;

  @IsInt()
  account_type_id!: number;

  @IsOptional()
  @IsString()
  parent_account_id?: string;

  @IsOptional()
  @IsString()
  cost_center_id?: string;

  @IsOptional()
  @IsBoolean()
  allows_transactions?: boolean;
}

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  account_name?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  cost_center_id?: string;
}
