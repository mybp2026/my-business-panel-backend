import { IsUUID, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
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
}
