import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CompositionComponentDto {
  @IsUUID()
  child_product_variant_id!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;
}

export class ReplaceCompositionDto {
  @IsUUID()
  tenant_id!: string;

  @IsUUID()
  parent_product_variant_id!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CompositionComponentDto)
  components!: CompositionComponentDto[];
}

export class UpdateComponentQuantityDto {
  @IsNumber()
  @IsPositive()
  quantity!: number;
}
