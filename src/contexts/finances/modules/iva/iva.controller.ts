import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IvaService } from './iva.service';
import type { IvaSummaryResponse } from './interface/iva.interface';

@ApiTags('IVA')
@Controller('iva')
export class IvaController {
  constructor(private readonly ivaService: IvaService) {}

  @ApiOperation({
    summary: 'Resumen de IVA del período',
    description:
      'Devuelve el desglose de IVA débito, crédito, CxP, recuperable, notas de crédito y neto a pagar a Hacienda CR.',
  })
  @ApiQuery({ name: 'start', required: true, example: '2026-01-01' })
  @ApiQuery({ name: 'end', required: true, example: '2026-06-30' })
  @ApiResponse({ status: 200, description: 'Resumen de IVA calculado.' })
  @Get('summary/:tenantId')
  getSummary(
    @Param('tenantId') tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<IvaSummaryResponse> {
    return this.ivaService.getSummary(tenantId, start, end);
  }
}
