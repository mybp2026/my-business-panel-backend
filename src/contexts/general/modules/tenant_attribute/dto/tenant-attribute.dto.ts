import { IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export class CreateTenantAttributeDto {
  @IsUUID()
  tenant_id!: string;

  @IsOptional()
  @IsUUID()
  global_attribute_id?: string;

  @ValidateIf((o) => !o.global_attribute_id)
  @IsString()
  attribute_name?: string;
}

export class UpdateTenantAttributeDto {
  @IsOptional()
  @IsString()
  attribute_name?: string;
}
