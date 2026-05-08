import {
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class RegisterTransactionDto {
  @IsNotEmpty()
  @IsUUID()
  cash_register_session_id!: string;

  @IsNotEmpty()
  @IsDecimal()
  @IsPositive()
  amount!: number;

  @IsNotEmpty()
  @IsDateString()
  transaction_time!: string;
}
