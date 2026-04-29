import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { createBranchDoc } from '@/docs/contexts/general/branch';

export class CreateBranchDto {
  @ApiProperty(createBranchDoc.dto.tenant_id)
  @IsNotEmpty()
  @IsUUID()
  tenant_id!: string;

  @ApiProperty(createBranchDoc.dto.branch_name)
  @IsNotEmpty()
  @IsString()
  branch_name!: string;

  @ApiPropertyOptional(createBranchDoc.dto.address)
  @IsOptional()
  @IsString()
  branch_address?: string;

  @ApiPropertyOptional(createBranchDoc.dto.contact_email)
  @IsOptional()
  @IsString()
  contact_email?: string;

  @ApiProperty(createBranchDoc.dto.branch_number)
  @IsNotEmpty()
  @IsString()
  branch_number!: string;

  @ApiPropertyOptional(createBranchDoc.dto.is_main_branch)
  @IsOptional()
  @IsBoolean()
  is_main_branch: boolean = true;

  /**
   * Código de territorio (DGT-R-48-2016): 5 dígitos en formato PCCDD
   * P = provincia (1 dígito), CC = cantón (2 dígitos), DD = distrito (2 dígitos)
   * Ej: "10101" = San José / San José / Carmen
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}$/, {
    message:
      'territorio_code debe ser exactamente 5 dígitos numéricos (ej: "10101")',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  territorio_code?: string;

  @IsOptional()
  @IsString()
  otras_senas?: string;
}
