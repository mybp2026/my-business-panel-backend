import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAttributeValueDto {
  @IsUUID()
  tenant_id!: string;

  @IsUUID()
  tenant_attribute_id!: string;

  @IsString()
  value!: string;
}

export class UpdateAttributeValueDto {
  @IsOptional()
  @IsString()
  value?: string;
}
