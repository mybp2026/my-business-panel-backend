import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateOrderStatusDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  status_id!: number;
}
