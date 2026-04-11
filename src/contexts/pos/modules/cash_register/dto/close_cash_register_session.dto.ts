import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CloseCashRegisterSessionDto {
  @IsNotEmpty()
  @IsUUID()
  cash_register_session_id!: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  closing_amount!: number;

  @IsOptional()
  @IsDateString()
  closed_at?: string = new Date().toISOString();
}
