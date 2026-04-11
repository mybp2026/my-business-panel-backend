import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class NewSuspentionDto {
  @IsNotEmpty()
  @IsUUID()
  employee_id!: string;

  @IsNotEmpty()
  @IsDateString()
  suspentionStart!: string;

  @IsNotEmpty()
  @IsDateString()
  suspentionEnd!: string;

  @IsNotEmpty()
  @IsString()
  reason!: string;

  @IsNotEmpty()
  @IsUUID()
  branchId!: string;
}

export class UpdateSuspention extends PartialType(NewSuspentionDto) {}
