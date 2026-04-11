import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { updateOrderStatusDoc } from '@/docs/contexts/purchase/purchase';

export class UpdateOrderStatusDto {
  @ApiProperty(updateOrderStatusDoc.dto.status_id)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  status_id!: number;
}
