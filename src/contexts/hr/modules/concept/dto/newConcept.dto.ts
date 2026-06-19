import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { createConceptDoc } from '@/docs/contexts/hr/concept';

export class NewConceptDto {
  @ApiProperty(createConceptDoc.dto.tenantId)
  @IsUUID()
  tenantId!: string;

  @ApiProperty(createConceptDoc.dto.name)
  @IsString()
  name!: string;

  @ApiProperty(createConceptDoc.dto.type)
  @IsString()
  type!: 'earning' | 'deduction';

  @ApiProperty(createConceptDoc.dto.calcMethod)
  @IsString()
  calcMethod!: 'fixed' | 'percentage' | 'formula' | 'manual';

  @ApiProperty(createConceptDoc.dto.isTaxable)
  @IsBoolean()
  isTaxable!: boolean;

  @ApiProperty(createConceptDoc.dto.baseValue)
  @IsNumber()
  baseValue!: number;

  @ApiProperty(createConceptDoc.dto.code)
  @IsString()
  @IsOptional()
  code?: string;
}
