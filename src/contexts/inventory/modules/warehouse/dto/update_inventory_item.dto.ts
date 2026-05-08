import { IsDateString, IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  stock?: number;

  @IsOptional()
  @IsDateString()
  expiration_date?: string | null;
}
