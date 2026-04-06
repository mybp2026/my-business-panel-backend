import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ContractDto {
  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;

  @IsNumber()
  hours!: number;

  @IsNumber()
  base_salary!: number;

  @IsString()
  duties!: string;

  @IsNumber()
  turn_type!: number;

  @IsNumber()
  turn_id!: number;
}

export class NewEmployeeDto {
  @IsUUID()
  user_id!: string;

  @IsUUID()
  tenant_id!: string;

  @IsUUID()
  branch_id!: string;

  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsString()
  doc_number!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsNumber()
  payment_schedule_id!: number;

  @ValidateNested()
  @Type(() => ContractDto)
  contractData!: ContractDto;
}

export class CreateUserEmployeeInfoDto {
  @IsUUID()
  tenant_id!: string;

  @IsUUID()
  branch_id!: string;

  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsString()
  doc_number!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsNumber()
  payment_schedule_id!: number;

  @ValidateNested()
  @Type(() => ContractDto)
  contractData!: ContractDto;
}

export class NewSingleEmployeeDto {
  @IsUUID()
  user_id!: string;

  @IsUUID()
  tenant_id!: string;

  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsString()
  doc_number!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsNumber()
  payment_schedule_id!: number;
}
