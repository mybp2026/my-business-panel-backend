import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { generalQueries } from '@general/general.queries';
import { encrypt, decrypt } from '@/common/crypto/aes-256-gcm';
import { ITenantHaciendaCredentials } from './tenant-hacienda-config.interface';

const { tenantHaciendaConfig } = generalQueries;

@Injectable()
export class TenantHaciendaConfigService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getCredentials(tenantId: string): Promise<ITenantHaciendaCredentials | null> {
    const { rows } = await this.db.query(tenantHaciendaConfig.getByTenantId, [tenantId]);

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
    credentials: ITenantHaciendaCredentials,
  ): Promise<string> {
    const existing = await this.db.query(tenantHaciendaConfig.getByTenantId, [tenantId]);

    if (existing.rows.length) {
      await this.db.query(tenantHaciendaConfig.update, [
        tenantId,
        encrypt(credentials.haciendaUsername),
        encrypt(credentials.haciendaPassword),
        credentials.haciendaClientId,
        encrypt(credentials.p12Base64),
        encrypt(credentials.p12Password),
      ]);
      return existing.rows[0].tenant_hacienda_config_id;
    }

    const { rows } = await this.db.query(tenantHaciendaConfig.create, [
      tenantId,
      encrypt(credentials.haciendaUsername),
      encrypt(credentials.haciendaPassword),
      credentials.haciendaClientId,
      encrypt(credentials.p12Base64),
      encrypt(credentials.p12Password),
    ]);

    return rows[0].tenant_hacienda_config_id;
  }

  async deactivate(tenantId: string): Promise<void> {
    await this.db.query(tenantHaciendaConfig.deactivate, [tenantId]);
  }
}
