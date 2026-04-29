import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTenantProductGroupTypeDto {
  @IsUUID()
  tenant_id!: string;

  @IsString()
  type_name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateTenantProductGroupTypeDto {
  @IsOptional()
  @IsString()
  type_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
