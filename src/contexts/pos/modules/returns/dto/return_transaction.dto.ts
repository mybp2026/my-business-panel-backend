import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsUUID } from 'class-validator';

export class ReturnTransactionDto {
  @IsUUID()
  invoice_id!: string;

  @IsUUID()
  tenant_customer_id!: string;

  @IsNumber()
  total_refund_amount!: number;

  @IsNumber()
  refund_method!: number;

  @IsNumber()
  return_status_id!: number;

  @Type(() => Date)
  @IsDate()
  return_date!: Date;

  return_products!: ReturnProduct[];
}

export interface ReturnProduct {
  quantity: number;
  unit_price: number;
  total_price: number;
  sale_item_id: string;
}

export interface BulkUpdateProducts {
  sale_item_id: string;
  quantity: number;
  total_price: number;
}
