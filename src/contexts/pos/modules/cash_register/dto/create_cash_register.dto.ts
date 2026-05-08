import {
  IsUUID,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { createCashRegisterDoc } from '@/docs/contexts/pos/cash_register';

export class CreateCashRegisterDto {
  @ApiProperty(createCashRegisterDoc.dto.branch_id)
  @IsUUID()
  @IsNotEmpty()
  branch_id!: string;

  @ApiProperty(createCashRegisterDoc.dto.register_name)
  @IsNotEmpty()
  register_name!: string;

  @ApiProperty(createCashRegisterDoc.dto.is_active)
  @IsOptional()
  @IsBoolean()
  is_active: boolean = true;

  /**
   * Optional plain-text key required for non-admin users to open/close a
   * session. Empty string is normalised to NULL by the service so the field
   * can be cleared via the update endpoint.
   */
  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(64)
  cash_register_key?: string | null;
}
