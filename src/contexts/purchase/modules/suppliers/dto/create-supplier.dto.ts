import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { createSupplierDoc } from '@/docs/contexts/purchase/suppliers';

export class CreateSupplierDto {
  @ApiProperty(createSupplierDoc.dto.supplier_name)
  @IsString()
  supplier_name!: string;

  @ApiProperty(createSupplierDoc.dto.supplier_contact_info)
  @IsString()
  supplier_contact_info!: string;

  @ApiProperty(createSupplierDoc.dto.supplier_address)
  @IsString()
  supplier_address!: string;

  @ApiProperty(createSupplierDoc.dto.supplier_notes)
  @IsOptional()
  @IsString()
  supplier_notes?: string;
}
