import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { createEmployeeDoc } from '@/docs/contexts/hr/employee';

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
  @ApiProperty(createEmployeeDoc.dto.user_id)
  @IsUUID()
  user_id!: string;

  @ApiProperty(createEmployeeDoc.dto.tenant_id)
  @IsUUID()
  tenant_id!: string;

  @ApiProperty(createEmployeeDoc.dto.branch_id)
  @IsUUID()
  branch_id!: string;

  @ApiProperty(createEmployeeDoc.dto.first_name)
  @IsString()
  first_name!: string;

  @ApiProperty(createEmployeeDoc.dto.last_name)
  @IsString()
  last_name!: string;

  @ApiProperty(createEmployeeDoc.dto.doc_number)
  @IsString()
  doc_number!: string;

  @ApiProperty(createEmployeeDoc.dto.phone)
  @IsString()
  phone!: string;

  @ApiProperty(createEmployeeDoc.dto.email)
  @IsEmail()
  email!: string;

  @ApiProperty(createEmployeeDoc.dto.payment_schedule_id)
  @IsNumber()
  payment_schedule_id!: number;

  @ApiProperty(createEmployeeDoc.dto.contractData)
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
