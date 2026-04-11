import {
  IsUUID,
  IsNotEmpty,
  IsPositive,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class StartCashRegisterSessionDto {
  @IsNotEmpty()
  @IsUUID()
  cash_register_id!: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  opening_amount!: number;

  @IsOptional()
  @IsDateString()
  opened_at: string = new Date().toISOString();
}
