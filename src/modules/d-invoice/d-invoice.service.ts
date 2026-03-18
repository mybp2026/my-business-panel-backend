import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import {
  DInvoice,
  InvoiceDB,
  FullInvoice,
} from './interface/d-invoice.interface';
import { queries } from '@/queries';
import { InvalidInvoice } from '@/common/errors/invalid_bill.error';

@Injectable()
export class DInvoiceService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async createDInvoice(data: DInvoice, dbClient?: any) {
    const {
      tenant_customer_id,
      currency_id,
      subtotal_amount,
      tax_amount,
      total_amount,
      invoiced_at,
      updated_at,
      sale_id,
    } = data;
    const res = await (dbClient || this.db).query(queries.dInvoice.create, [
      tenant_customer_id,
      currency_id,
      subtotal_amount,
      tax_amount,
      total_amount,
      invoiced_at,
      updated_at,
      sale_id,
    ]);
    if (res.rows.length == 0) throw new InvalidInvoice();
    return { message: 'DInvoice created!', invoice: res.rows[0] };
  }

  async getTenantDInvoices(tenantId: string): Promise<InvoiceDB[]> {
    const result = await this.db.query(queries.dInvoice.getBills, [tenantId]);
    return result.rows;
  }

  async getCustomerDInvoices(
    tenantId: string,
    doc: string,
  ): Promise<InvoiceDB[]> {
    const result = await this.db.query(queries.dInvoice.getCustomerDInvoices, [
      tenantId,
      doc,
    ]);
    return result.rows;
  }

  async getDInvoiceById(invoiceId: string): Promise<FullInvoice> {
    const result = await this.db.query(queries.dInvoice.getDInvoiceById, [
      invoiceId,
    ]);
    if (result.rows.length == 0) throw new InvalidInvoice();
    return result.rows[0];
  }

  async deleteDInvoice(invoiceId: string) {
    const result = await this.db.query(queries.dInvoice.deleteDInvoice, [
      invoiceId,
    ]);
    if (result.rows.length == 0)
      throw new InternalServerErrorException('Error deleting invoice from db.');
    return { message: `DInvoice with id: ${invoiceId} deleted` };
  }
}
