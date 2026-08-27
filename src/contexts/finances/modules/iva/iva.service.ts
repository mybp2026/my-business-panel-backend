import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE } from '../../../general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { ivaQueries } from './iva.queries';
import type {
  IvaSummaryFromDb,
  IvaSummaryResponse,
} from './interface/iva.interface';

@Injectable()
export class IvaService {
  private readonly logger = new Logger(IvaService.name);

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getSummary(
    tenantId: string,
    start: string,
    end: string,
  ): Promise<IvaSummaryResponse> {
    const { rows } = await this.db.query<IvaSummaryFromDb>(
      ivaQueries.getSummary,
      [tenantId, start, end],
    );

    const row = rows[0];

    return {
      iva_debito: Number(row.iva_debito),
      iva_credito: Number(row.iva_credito),
      iva_cxp: Number(row.iva_cxp),
      iva_recuperable: Number(row.iva_recuperable),
      iva_notas_credito: Number(row.iva_notas_credito),
      iva_debito_ajustado: Number(row.iva_debito_ajustado),
      iva_neto: Number(row.iva_neto),
    };
  }
}
