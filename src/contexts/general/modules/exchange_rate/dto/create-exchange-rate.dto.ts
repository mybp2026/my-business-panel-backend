import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateExchangeRateDto {
  @IsInt()
  @IsPositive()
  from_currency_id!: number;

  @IsInt()
  @IsPositive()
  to_currency_id!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0.000001)
  rate!: number;

  @IsDateString()
  effective_date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  source?: string;
}
