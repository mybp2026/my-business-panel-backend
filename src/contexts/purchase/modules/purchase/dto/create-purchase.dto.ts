import {
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  IsPositive,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderItemDto {
  @IsUUID()
  product_variant_id!: string;

  @IsPositive()
  quantity_ordered!: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  unit_price!: number;
}

export class CreatePurchaseDto {
  @IsUUID()
  supplier_id!: string;

  @IsUUID()
  warehouse_id!: string;

  @IsDateString()
  expected_delivery_date!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items!: PurchaseOrderItemDto[];

  @IsOptional()
  has_invoice?: boolean;

  @IsOptional()
  @IsEnum(['CREDIT', 'IN_FULL'])
  payment_condition?: string;
}
