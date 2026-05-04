import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductInsertDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewProductDto)
  products!: NewProductDto[];
}

export class NewProductDto {
  @IsUUID()
  tenant_id!: string;

  @IsString()
  sku!: string;

  @IsString()
  variant_name!: string;

  @IsOptional()
  @IsString()
  @Length(13, 13, { message: 'cabys_code must be exactly 13 characters' })
  @Matches(/^\d{13}$/, { message: 'cabys_code must contain exactly 13 digits' })
  cabys_code?: string;

  @IsNumber()
  unit_price!: number;

  @IsOptional()
  @IsNumber()
  cost_price?: number;

  @IsOptional()
  @IsUUID()
  supplier_id?: string;

  @IsOptional()
  @IsBoolean()
  giftable?: boolean;

  @IsOptional()
  @IsNumber()
  giftable_from?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  attribute_value_ids?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  group_ids?: string[];
}

export interface ProductInsert {
  tenant_id: string;
  sku: string;
  variant_name: string;
  cabys_code?: string;
  unit_price: number;
  cost_price?: number;
  supplier_id?: string;
  giftable?: boolean;
  giftable_from?: number;
  attribute_value_ids?: string[];
  group_ids?: string[];
}
