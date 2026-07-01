import { IsIn, IsOptional } from 'class-validator';
import { ProfitabilityInterval } from '../interface/profitability.interface';

export const PROFITABILITY_INTERVALS: ProfitabilityInterval[] = [
  '24h',
  '7d',
  '15d',
  '30d',
  '90d',
  '180d',
  '365d',
];

export class GetProfitabilityDto {
  // Preset de intervalo. Default '24h' si no se envia (R1).
  @IsOptional()
  @IsIn(PROFITABILITY_INTERVALS)
  interval?: ProfitabilityInterval;
}
