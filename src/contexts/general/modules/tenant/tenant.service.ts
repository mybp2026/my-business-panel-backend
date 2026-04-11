import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { generalQueries } from '@general/general.queries';
import { NewTenantDto } from './dto/newTenant.dto';
import { UpdateTenantDto } from './dto/updateTenant.dto';
import { Tenant } from './interface/tenant.interface';

const { tenant } = generalQueries;

@Injectable()
export class TenantService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getAllTenants(): Promise<Tenant[]> {
    const { rows } = await this.db.query(tenant.all);
    return rows;
  }

  async getTenantById(tenantId: string): Promise<Tenant> {
    const { rows } = await this.db.query(tenant.byId, [tenantId]);
    return rows[0];
  }

  async createTenant(tenantInfo: NewTenantDto) {
    const {
      tenant_name,
      contact_email,
      is_subscribed,
      region_id,
      economic_activity,
      sign,
      identification,
    } = tenantInfo;

    const { rows } = await this.db.query(tenant.create, [
      tenant_name,
      contact_email,
      identification,
      economic_activity,
      sign,
      is_subscribed,
      region_id,
    ]);
    return rows[0];
  }

  async updateTenant(tenantId: string, tenantData: UpdateTenantDto) {
    const { ...updates } = tenantData;

    const updateKeys = Object.keys(updates).filter(
      (key) => updates[key as keyof typeof updates] !== undefined,
    );

    if (updateKeys.length === 0) {
      throw new Error('No valid fields to update');
    }

    const setClause: string[] = [];
    const paramsArray: any[] = [];
    let index = 1;

    for (const key of updateKeys) {
      const validKey = key as keyof typeof updates;
      setClause.push(`${key} = $${index}`);
      paramsArray.push(updates[validKey]);
      index++;
    }

    paramsArray.push(tenantId);

    const setString = setClause.join(', ');

    const queryString = `
      UPDATE general_schema.tenant
      SET ${setString}
      WHERE tenant_id = $${index}
      RETURNING *
    `;

    const up = await this.db.query(queryString, paramsArray);

    return { message: 'Tenant updated successfully', tenant: up.rows[0] };
  }

  async deleteTenant(tenantId: string) {
    const exist = await this.getTenantById(tenantId);
    if (!exist) {
      throw new Error('Tenant not found');
    }

    const deletedTenant = await this.db.query(tenant.delete, [tenantId]);
    return {
      message: 'Tenant deleted successfully',
      tenant: deletedTenant.rows[0],
    };
  }
}
