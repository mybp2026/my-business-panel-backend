import { IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  supplier_name!: string;

  @IsString()
  supplier_contact_info!: string;

  @IsString()
  supplier_address!: string;

  @IsOptional()
  @IsString()
  supplier_notes?: string;
}
