import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class JournalEntryLineDto {
  @IsString()
  account_id!: string;

  @IsOptional()
  @IsString()
  cost_center_id?: string;

  @IsNumber()
  debit_amount!: number;

  @IsNumber()
  credit_amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateJournalEntryDto {
  @IsInt()
  source_type_id!: number;

  @IsOptional()
  @IsString()
  source_id?: string;

  @IsDateString()
  entry_date!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  lines!: JournalEntryLineDto[];
}
