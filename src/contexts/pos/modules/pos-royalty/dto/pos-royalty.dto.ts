import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateRoyaltyRuleDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsNumber()
  @Min(0.01)
  min_amount!: number;
}

export class UpdateRoyaltyRuleDto {
  @IsNumber()
  @Min(0.01)
  min_amount!: number;
}

export class CreateRoyaltyOptionDto {
  @IsUUID()
  @IsNotEmpty()
  royalty_rule_id!: string;

  @IsUUID()
  @IsNotEmpty()
  tenant_product_group_id!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsEnum(['any', 'specific'])
  scope!: 'any' | 'specific';
}

export class UpdateRoyaltyOptionDto {
  @IsInt()
  @Min(1)
  quantity!: number;

  @IsEnum(['any', 'specific'])
  scope!: 'any' | 'specific';
}

export class AddOptionProductDto {
  @IsUUID()
  @IsNotEmpty()
  product_variant_id!: string;
}

export class SetOptionProductsDto {
  @IsUUID("4", { each: true })
  product_variant_ids!: string[];
}

export class GetApplicableRulesDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsNumber()
  @Min(0)
  amount!: number;
}

export class GetGiftableProductsDto {
  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  tenant_product_group_id?: string;
}
