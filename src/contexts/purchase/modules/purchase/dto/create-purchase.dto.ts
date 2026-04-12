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
import { ApiProperty } from '@nestjs/swagger';
import { createPurchaseOrderDoc } from '@/docs/contexts/purchase/purchase';

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
  @ApiProperty(createPurchaseOrderDoc.dto.supplier_id)
  @IsUUID()
  supplier_id!: string;

  @ApiProperty(createPurchaseOrderDoc.dto.warehouse_id)
  @IsUUID()
  warehouse_id!: string;

  @ApiProperty(createPurchaseOrderDoc.dto.expected_delivery_date)
  @IsDateString()
  expected_delivery_date!: string;

  @ApiProperty(createPurchaseOrderDoc.dto.items)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items!: PurchaseOrderItemDto[];

  @ApiProperty(createPurchaseOrderDoc.dto.has_invoice)
  @IsOptional()
  has_invoice?: boolean;

  @ApiProperty(createPurchaseOrderDoc.dto.payment_condition)
  @IsOptional()
  @IsEnum(['CREDIT', 'IN_FULL'])
  payment_condition?: string;
}
