import { IsArray, IsUUID } from 'class-validator';

export class ReplaceVariantGroupsDto {
  @IsUUID()
  tenant_id!: string;

  @IsUUID()
  product_variant_id!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  group_ids!: string[];
}
