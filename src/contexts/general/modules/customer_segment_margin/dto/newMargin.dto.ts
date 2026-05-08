import { IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { createMarginDoc } from '@/docs/contexts/general/customer_segment_margin';

export class NewMarginDto {
  @ApiProperty(createMarginDoc.dto.tenant_id)
  @IsUUID()
  tenant_id!: string;

  @ApiProperty(createMarginDoc.dto.customer_segment_id)
  @IsNumber()
  customer_segment_id!: number;

  @ApiProperty(createMarginDoc.dto.customer_segment_margin_type)
  @IsNumber()
  customer_segment_margin_type!: number;

  @ApiProperty(createMarginDoc.dto.spending_threshold)
  @IsNumber()
  spending_threshold!: number;

  @ApiProperty(createMarginDoc.dto.seniority_months)
  @IsNumber()
  seniority_months!: number;

  @ApiProperty(createMarginDoc.dto.frequency_per_month)
  @IsNumber()
  frequency_per_month!: number;
}
