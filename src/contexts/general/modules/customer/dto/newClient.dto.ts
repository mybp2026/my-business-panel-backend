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

  @IsNotEmpty()
  @IsString()
  economic_activity!: string;

  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  birthdate?: Date;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsBoolean()
  @IsOptional()
  is_tenant?: boolean;
}
