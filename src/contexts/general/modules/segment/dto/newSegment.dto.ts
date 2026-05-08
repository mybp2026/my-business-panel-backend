import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { newSegmentDoc } from '@/docs/contexts/general/segment';

export class NewSegmentDto {
  @ApiProperty(newSegmentDoc.dto.segment_name)
  @IsString()
  segment_name!: string;

  @ApiProperty(newSegmentDoc.dto.segment_hierarchy)
  @IsNumber()
  segment_hierarchy!: number;
}
