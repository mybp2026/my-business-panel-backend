import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { newPaymentDoc } from '@/docs/contexts/general/customer_payment';
import { Payment } from '../interface/payments.interface';

export class NewCustomerPaymentDto {
  @ApiProperty(newPaymentDoc.dto.tenant_customer_id)
  @IsUUID()
  tenant_customer_id!: string;

  @ApiProperty(newPaymentDoc.dto.sale_id)
  @IsUUID()
  sale_id?: string;

  @ApiProperty(newPaymentDoc.dto.payment_method_id)
  @IsNumber()
  payment_method_id!: string;

  @ApiProperty(newPaymentDoc.dto.payment_amount)
  @IsNumber()
  payment_amount!: number;

  @ApiProperty(newPaymentDoc.dto.payment_date)
  @Type(() => Date)
  @IsDate()
  payment_date!: Date;

  @ApiProperty(newPaymentDoc.dto.currency_id)
  @IsNumber()
  currency_id!: number;

  @ApiProperty(newPaymentDoc.dto.verified)
  @IsBoolean()
  verified!: boolean;
}

export class testdto {
  payments!: Payment[];
  sale_id!: string;
}
