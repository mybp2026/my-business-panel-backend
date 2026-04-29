import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBranchDto {
  @IsNotEmpty()
  @IsUUID()
  tenant_id!: string;

  @IsNotEmpty()
  @IsString()
  branch_name!: string;

  @IsOptional()
  @IsString()
  branch_address?: string;

  @IsOptional()
  @IsString()
  contact_email?: string;

  @IsNotEmpty()
  @IsString()
  branch_number!: string;

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
