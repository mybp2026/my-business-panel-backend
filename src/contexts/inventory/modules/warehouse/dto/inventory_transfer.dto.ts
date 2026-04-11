import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
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
