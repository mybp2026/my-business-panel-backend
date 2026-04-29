import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePaysheetDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @IsDateString()
  @IsNotEmpty()
  periodStart!: string;

  @IsDateString()
  @IsNotEmpty()
  periodEnd!: string;
}

export class ProcessPaysheetDto {
  @IsUUID()
  @IsNotEmpty()
  branch_id!: string;

  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsDateString()
  @IsNotEmpty()
  period_start!: string;

  @IsDateString()
  @IsNotEmpty()
  period_end!: string;
}
