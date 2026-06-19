import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { generalQueries } from '@general/general.queries';
import { encrypt, decrypt } from '@/common/crypto/aes-256-gcm';
import {
  ITenantHaciendaCredentials,
  ITenantHaciendaCredentialsInput,
} from './tenant-hacienda-config.interface';

const { tenantHaciendaConfig } = generalQueries;

@Injectable()
export class TenantHaciendaConfigService {
  private readonly logger = new Logger(TenantHaciendaConfigService.name);

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getCredentials(
    tenantId: string,
  ): Promise<ITenantHaciendaCredentials | null> {
    const { rows } = await this.db.query(tenantHaciendaConfig.getByTenantId, [
      tenantId,
    ]);

    if (!rows.length) return null;

    const row = rows[0];

    return {
      haciendaUsername: decrypt(row.hacienda_username),
      haciendaPassword: decrypt(row.hacienda_password),
      haciendaClientId: row.hacienda_client_id,
      p12Base64: decrypt(row.p12_base64),
      p12Password: decrypt(row.p12_password),
    };
  }

  async saveCredentials(
    tenantId: string,
    input: ITenantHaciendaCredentialsInput,
  ): Promise<string> {
    const existing = await this.db.query(tenantHaciendaConfig.getByTenantId, [
      tenantId,
    ]);

    if (existing.rows.length) {
      // Partial update: solo se sobreescriben los campos provistos.
      const setClauses: string[] = [
        'hacienda_username = $2',
        'hacienda_client_id = $3',
        'updated_at = NOW()',
      ];
      const params: any[] = [
        tenantId,
        encrypt(input.haciendaUsername),
        input.haciendaClientId,
      ];
      let idx = params.length + 1;

      if (
        input.haciendaPassword !== undefined &&
        input.haciendaPassword !== ''
      ) {
        setClauses.push(`hacienda_password = $${idx++}`);
        params.push(encrypt(input.haciendaPassword));
      }
      if (input.p12Base64 !== undefined && input.p12Base64 !== '') {
        setClauses.push(`p12_base64 = $${idx++}`);
        params.push(encrypt(input.p12Base64));
      }
      if (input.p12Password !== undefined && input.p12Password !== '') {
        setClauses.push(`p12_password = $${idx++}`);
        params.push(encrypt(input.p12Password));
      }

      const sql = `
        UPDATE general_schema.tenant_hacienda_config
        SET ${setClauses.join(', ')}
        WHERE tenant_id = $1 AND is_active = TRUE
        RETURNING tenant_hacienda_config_id
      `;

      const result = await this.db.query(sql, params);
      if (!result.rows.length) {
        throw new BadRequestException(
          'No se encontró configuración activa para actualizar',
        );
      }
      this.logger.log(
        `Hacienda config actualizada para tenant ${tenantId} — client_id=${input.haciendaClientId}, campos: ${setClauses.length - 1}`,
      );
      return result.rows[0].tenant_hacienda_config_id;
    }

    // Create requires all fields.
    if (!input.haciendaPassword || !input.p12Base64 || !input.p12Password) {
      throw new BadRequestException(
        'Para crear configuración nueva, contraseña ATV, P12 y contraseña P12 son requeridos',
      );
    }

    const { rows } = await this.db.query(tenantHaciendaConfig.create, [
      tenantId,
      encrypt(input.haciendaUsername),
      encrypt(input.haciendaPassword),
      input.haciendaClientId,
      encrypt(input.p12Base64),
      encrypt(input.p12Password),
    ]);

    return rows[0].tenant_hacienda_config_id;
  }

  async deactivate(tenantId: string): Promise<void> {
    await this.db.query(tenantHaciendaConfig.deactivate, [tenantId]);
  }
}
