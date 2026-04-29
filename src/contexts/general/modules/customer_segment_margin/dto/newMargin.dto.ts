import { IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { createNewMarginDoc } from '@/docs/contexts/general/customer_segment_margin';

export class NewMarginDto {
  @ApiProperty(createNewMarginDoc.dto.tenant_id)
  @IsUUID()
  tenant_id!: string;

  @ApiProperty(createNewMarginDoc.dto.customer_segment_id)
  @IsNumber()
  customer_segment_id!: number;

  @ApiProperty(createNewMarginDoc.dto.customer_segment_margin_type)
  @IsNumber()
  customer_segment_margin_type!: number;

  @ApiProperty(createNewMarginDoc.dto.spending_threshold)
  @IsNumber()
  spending_threshold!: number;

  @ApiProperty(createNewMarginDoc.dto.seniority_months)
  @IsNumber()
  seniority_months!: number;

  @ApiProperty(createNewMarginDoc.dto.frequency_per_month)
  @IsNumber()
  frequency_per_month!: number;
}
