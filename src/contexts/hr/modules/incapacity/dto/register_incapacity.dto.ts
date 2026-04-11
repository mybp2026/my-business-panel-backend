import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class RegisterIncapacityDto {
  @IsNotEmpty()
  @IsUUID()
  employee_id!: string;

  @IsNotEmpty()
  @IsUUID()
  branch_id!: string;

  @IsNotEmpty()
  @IsString()
  type!: string;

  @IsNotEmpty()
  @IsDateString()
  period_start!: string;

  @IsNotEmpty()
  @IsDateString()
  period_end!: string;

  @IsNotEmpty()
  @IsNumber()
  days_paying!: number;

  @IsNotEmpty()
  @IsNumber()
  percentage_to_pay!: number;
}

export class UpdateIncapacityDto extends PartialType(RegisterIncapacityDto) {}
