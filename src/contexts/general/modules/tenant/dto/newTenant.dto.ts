import { IsBoolean, IsOptional, IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class NewTenantDto {
  @IsNotEmpty()
  @IsString()
  tenant_name!: string;

  @IsNotEmpty()
  @IsString()
  contact_email!: string;

  @IsOptional()
  @IsBoolean()
  is_subscribed?: boolean;

  @IsNotEmpty()
  @IsNumber()
  region_id!: number;

  @IsNotEmpty()
  @IsString()
  identification!: string;

  @IsNotEmpty()
  @IsString()
  economic_activity!: string;

  @IsNotEmpty()
  @IsString()
  sign!: string;
}
