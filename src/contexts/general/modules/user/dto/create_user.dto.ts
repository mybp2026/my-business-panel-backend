import {
  IsEmail,
  IsNumber,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContractDataDto {
  @IsNotEmpty()
  @IsString()
  start_date!: string;

  @IsNotEmpty()
  @IsString()
  end_date!: string;

  @IsNotEmpty()
  @IsNumber()
  hours!: number;

  @IsNotEmpty()
  @IsNumber()
  base_salary!: number;

  @IsNotEmpty()
  @IsString()
  duties!: string;

  @IsNotEmpty()
  @IsNumber()
  turn_type!: number;

  @IsNotEmpty()
  @IsNumber()
  turn_id!: number;
}

export class EmployeeInfoDto {
  @IsNotEmpty()
  @IsUUID()
  tenant_id!: string;

  @IsNotEmpty()
  @IsUUID()
  branch_id!: string;

  @IsNotEmpty()
  @IsString()
  first_name!: string;

  @IsNotEmpty()
  @IsString()
  last_name!: string;

  @IsNotEmpty()
  @IsString()
  doc_number!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsNumber()
  payment_schedule_id!: number;

  @ValidateNested()
  @Type(() => ContractDataDto)
  contractData!: ContractDataDto;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsUUID()
  tenant_id!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsNumber()
  role_id!: number;

  @ValidateNested()
  @Type(() => EmployeeInfoDto)
  employeeInfo!: EmployeeInfoDto;
}

export class CreateUserBulkDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users!: CreateUserDto[];
}
