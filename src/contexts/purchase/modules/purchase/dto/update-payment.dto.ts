import { PartialType } from '@nestjs/swagger';
import { CreatePaymentDto } from './create-payment.dto';
import { IsUUID, IsOptional } from 'class-validator';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsOptional()
  @IsUUID()
  purchase_account_payable_id?: string;
}
