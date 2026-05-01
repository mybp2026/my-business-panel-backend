import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateExchangeRateDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0.000001)
  rate?: number;

  @IsOptional()
  @IsDateString()
  effective_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;
}
