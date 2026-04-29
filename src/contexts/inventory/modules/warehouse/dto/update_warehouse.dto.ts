import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateWarehouseDto {
  @IsOptional()
  @IsString()
  warehouse_name?: string;

  @IsOptional()
  @IsString()
  warehouse_address?: string;

  @IsOptional()
  @IsBoolean()
  is_branch?: boolean;
}
