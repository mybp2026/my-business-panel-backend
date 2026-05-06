import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateExpenseTypeDto {
  @IsUUID()
  tenant_id!: string;

  @IsString()
  @IsNotEmpty()
  expense_type_name!: string;

  @IsString()
  @IsOptional()
  expense_type_detail?: string;
}

export class CreateExpenseDto {
  @IsUUID()
  expense_type_id!: string;

  @IsNumber()
  @Min(0.01)
  expense_amount!: number;

  @IsUUID()
  branch_id!: string;
}

export class UpdateExpenseStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: 'approved' | 'rejected' | 'cancelled';

  @IsString()
  @IsOptional()
  rejection_reason?: string;
}
