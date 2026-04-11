import {
  IsUUID,
  IsNotEmpty,
  IsPositive,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { startCashRegisterSessionDoc } from '@/docs/contexts/pos/cash_register';

export class StartCashRegisterSessionDto {
  @ApiProperty(startCashRegisterSessionDoc.dto.cash_register_id)
  @IsNotEmpty()
  @IsUUID()
  cash_register_id!: string;

  @ApiProperty(startCashRegisterSessionDoc.dto.opening_amount)
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  opening_amount!: number;

  @ApiProperty(startCashRegisterSessionDoc.dto.opened_at)
  @IsOptional()
  @IsDateString()
  opened_at: string = new Date().toISOString();
}
