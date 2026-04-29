import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class BulkInsertInventoryItemDto {
  @IsUUID()
  product_variant_id!: string;

  @IsInt()
  @IsPositive()
  stock!: number;

  @IsOptional()
  @IsDateString()
  expiration_date?: string;
}

export class BulkInsertInventoryDto {
  @IsUUID()
  warehouse_id!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkInsertInventoryItemDto)
  items!: BulkInsertInventoryItemDto[];
}
