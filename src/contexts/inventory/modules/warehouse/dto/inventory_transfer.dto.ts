import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class InventoryTransferDto {
  @IsUUID()
  origin_warehouse_id!: string;

  @IsUUID()
  destination_warehouse_id!: string;

  @IsUUID()
  tenant_id!: string;

  @IsOptional()
  @IsDateString()
  departure_date?: string | null;

  @IsOptional()
  @IsDateString()
  arrival_date?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryTransferProductDto)
  products!: InventoryTransferProductDto[];
}

export class InventoryTransferProductDto {
  @IsUUID()
  product_id!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;
}
