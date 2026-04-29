import { PartialType } from '@nestjs/swagger';
import { CreateCashRegisterDto } from './create_cash_register.dto';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateCashRegisterDto extends PartialType(CreateCashRegisterDto) {
  @IsNotEmpty()
  @IsUUID()
  cash_register_id!: string;
}
