import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { posQueries } from '@pos/pos.queries';
import { HaciendaService } from '../hacienda/hacienda.service';
import { TenantHaciendaConfigService } from '@/contexts/general/modules/tenant_hacienda_config/tenant-hacienda-config.service';
import { encrypt } from '@/common/crypto/aes-256-gcm';

const { eInvoice } = posQueries;

const CHECK_CRON = process.env.EINVOICE_CHECK_CRON || '0 */5 * * * *';
const LONG_DELAY_HOURS = Number(process.env.EINVOICE_LONG_DELAY_HOURS) || 2;
const MAX_ATTEMPTS = Number(process.env.EINVOICE_MAX_ATTEMPTS) || 2;

interface DueInvoiceRow {
  electronic_sale_invoice_id: string;
  key_number: string;
  created_at: string;
  check_attempts: number;
  tenant_id: string;
}

@Injectable()
export class EInvoiceStatusCron {
  private readonly logger = new Logger(EInvoiceStatusCron.name);
  private isRunning = false;

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly hacienda: HaciendaService,
    private readonly tenantHaciendaConfig: TenantHaciendaConfigService,
  ) {}

  @Cron(CHECK_CRON)
  async checkPendingInvoices(): Promise<void> {
    if (this.isRunning) {
      this.logger.debug('Previous tick still in flight, skipping');
      return;
    }
    this.isRunning = true;
    try {
      const { rows } = await this.db.query<DueInvoiceRow>(
        eInvoice.getDueInvoices,
      );
      if (!rows.length) return;

      this.logger.log(`Processing ${rows.length} due e-invoice(s)`);
      for (const invoice of rows) {
        await this.processInvoice(invoice);
      }
    } catch (err) {
      this.logger.error(`Cron tick failed: ${err}`);
    } finally {
      this.isRunning = false;
    }
  }

  async processInvoice(invoice: DueInvoiceRow): Promise<void> {
    const {
      electronic_sale_invoice_id: invoiceId,
      key_number: keyNumber,
      tenant_id: tenantId,
      check_attempts: attempts,
    } = invoice;

    const credentials = await this.tenantHaciendaConfig.getCredentials(tenantId);
    if (!credentials) {
      this.logger.warn(
        `No Hacienda credentials for tenant ${tenantId}, rescheduling invoice ${keyNumber}`,
      );
      await this.scheduleRetryOrFail(invoiceId, attempts);
      return;
    }

    try {
      const status = await this.hacienda.checkInvoiceStatus(
        tenantId,
        credentials,
        keyNumber,
      );

      if (status.indEstado === 'aceptado') {
        const enc = status.respuestaXml ? encrypt(status.respuestaXml) : null;
        await this.db.query(eInvoice.updateHaciendaResponse, [invoiceId, enc, 2]);
        this.logger.log(`Invoice ${keyNumber} aceptado`);
        return;
      }

      if (status.indEstado === 'rechazado') {
        const enc = status.respuestaXml ? encrypt(status.respuestaXml) : null;
        await this.db.query(eInvoice.updateHaciendaResponse, [invoiceId, enc, 3]);
        this.logger.log(`Invoice ${keyNumber} rechazado`);
        return;
      }

      this.logger.debug(
        `Invoice ${keyNumber} still pending (attempts=${attempts}), scheduling retry`,
      );
      await this.scheduleRetryOrFail(invoiceId, attempts);
    } catch (err) {
      this.logger.error(
        `Hacienda check failed for invoice ${keyNumber}: ${err}`,
      );
      await this.scheduleRetryOrFail(invoiceId, attempts);
    }
  }

  private async scheduleRetryOrFail(
    invoiceId: string,
    currentAttempts: number,
  ): Promise<void> {
    if (currentAttempts + 1 >= MAX_ATTEMPTS) {
      await this.db.query(eInvoice.markFailed, [invoiceId]);
      this.logger.warn(
        `Invoice ${invoiceId} timed out after ${currentAttempts + 1} attempts, marked status=4`,
      );
      return;
    }
    await this.db.query(eInvoice.markAttempt, [
      invoiceId,
      `${LONG_DELAY_HOURS} hours`,
    ]);
  }
}
