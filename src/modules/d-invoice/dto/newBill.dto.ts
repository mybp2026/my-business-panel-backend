import { IsDate, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class NewBillDto {
  @IsUUID()
  tenant_customer_id!: string;

  @IsNumber()
  currency_id!: number;

  @IsNumber()
  subtotal_amount!: number;

  @IsNumber()
  tax_amount!: number;

  @IsNumber()
  total_amount!: number;
}
