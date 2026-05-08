import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class NewClientDto {
  @IsNotEmpty()
  @IsUUID()
  tenant_id!: string;

  @IsNotEmpty()
  @IsString()
  first_name!: string;

  @IsNotEmpty()
  @IsString()
  last_name!: string;

  @IsNotEmpty()
  @IsNumber()
  document_type_id!: number;

  @IsNotEmpty()
  @IsString()
  document_number!: string;

  @IsOptional()
  @IsString()
  economic_activity?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  birthdate?: Date;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  segment_id?: number;

  @IsNotEmpty()
  @IsBoolean()
  @IsOptional()
  is_tenant?: boolean;

  @IsOptional()
  @IsBoolean()
  is_wholesale?: boolean;
}
