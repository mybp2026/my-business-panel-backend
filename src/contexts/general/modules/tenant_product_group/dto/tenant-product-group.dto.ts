import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTenantProductGroupDto {
  @IsUUID()
  tenant_id!: string;

  @IsUUID()
  tenant_product_group_type_id!: string;

  @IsOptional()
  @IsUUID()
  parent_group_id?: string | null;

  @IsString()
  group_name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  hierarchy_level?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateTenantProductGroupDto {
  @IsOptional()
  @IsString()
  group_name?: string;

  @IsOptional()
  parent_group_id?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  hierarchy_level?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
