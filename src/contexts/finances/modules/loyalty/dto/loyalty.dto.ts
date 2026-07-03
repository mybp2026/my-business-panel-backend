import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { LoyaltyInterval } from '../interface/loyalty.interface';

export const LOYALTY_INTERVALS: LoyaltyInterval[] = [
  '24h',
  '7d',
  '15d',
  '30d',
  '90d',
  '180d',
  '365d',
];

export class GetLoyaltyOverviewDto {
  // Preset de intervalo para el grafico de crecimiento. Default '30d' si no se envia.
  @IsOptional()
  @IsIn(LOYALTY_INTERVALS)
  interval?: LoyaltyInterval;

  // Filtro opcional por sucursal (solo afecta el grafico de crecimiento).
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
