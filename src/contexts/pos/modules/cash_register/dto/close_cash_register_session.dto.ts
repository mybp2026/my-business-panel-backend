import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
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

  /**
   * Required for non-admin roles when the cash register has a key configured.
   * Admin / superuser sessions bypass the check at the service level.
   */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  cash_register_key?: string;
}
