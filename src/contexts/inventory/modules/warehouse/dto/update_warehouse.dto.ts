import { IsOptional, IsString } from 'class-validator';

/**
 * Editable fields on an existing warehouse. The is_branch flag cannot be
 * toggled from the API — flipping it would corrupt the 1-to-1 invariant
 * with the parent branch (uq_warehouse_branch_sales_floor) and silently
 * break POS routing. Sales-floor lifecycle is owned by the branch insert
 * trigger.
 */
export class UpdateWarehouseDto {
  @IsOptional()
  @IsString()
  warehouse_name?: string;

  @IsOptional()
  @IsString()
  warehouse_address?: string;
}
