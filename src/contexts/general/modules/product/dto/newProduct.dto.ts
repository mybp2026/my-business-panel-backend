import { IsNumber, IsOptional, IsString, IsUUID, IsArray, ValidateNested } from 'class-validator';
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
  cabys_code?: string;

  @IsNumber()
  unit_price!: number;
}

export interface ProductInsert {
  tenant_id: string;
  sku: string;
  variant_name: string;
  cabys_code?: string;
  unit_price: number;
}
