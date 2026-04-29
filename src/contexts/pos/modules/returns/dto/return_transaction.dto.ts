import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ReturnProductDto {
  @IsUUID()
  sale_item_id!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unit_price!: number;

  @IsOptional()
  @IsNumber()
  total_price?: number;
}

export class ReturnTransactionDto {
  /**
   * Sale ID. The server resolves the corresponding digital + electronic
   * invoices from this and stores both invoice references in return_transaction.
   */
  @IsUUID()
  sale_id!: string;

  @IsOptional()
  @IsUUID()
  tenant_customer_id?: string;

  @IsOptional()
  @IsNumber()
  refund_method?: number;

  @IsOptional()
  @IsNumber()
  return_status_id?: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReturnProductDto)
  return_products!: ReturnProductDto[];
}

// Internal types kept for backward compatibility with existing helpers
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
