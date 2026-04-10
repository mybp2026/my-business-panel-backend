import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty()
  @IsUUID()
  tenant_id!: string;

  @IsNotEmpty()
  @IsString()
  branch_name!: string;

  @IsOptional()
  @IsString()
  branch_address?: string;

  @IsOptional()
  @IsString()
  contact_email?: string;

  @IsNotEmpty()
  @IsString()
  branch_number!: string;

  @IsOptional()
  @IsBoolean()
  is_main_branch: boolean = true;
}
