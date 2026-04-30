import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/**
 * Payload to register an auxiliary warehouse (bodega) for an existing
 * branch. Sales-floor warehouses (is_branch = TRUE) are provisioned
 * automatically by inventory_schema.fn_branch_create_warehouse when a
 * branch is inserted, so the API surface intentionally does NOT accept
 * is_branch from clients.
 */
export class CreateWarehouseDto {
  @IsUUID()
  @IsNotEmpty()
  branch_id!: string;

  @IsString()
  @IsNotEmpty()
  warehouse_name!: string;

  @IsString()
  @IsNotEmpty()
  warehouse_address!: string;
}
