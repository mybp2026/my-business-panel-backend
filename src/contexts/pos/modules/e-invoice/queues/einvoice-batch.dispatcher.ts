import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { QueueFacade } from '@/contexts/general/modules/queue/facade/queue.facade';
import { IEInvoiceJobData } from '../interface';
import { EINVOICE_STATUS_QUEUE } from './einvoice-status.queue';
import { posQueries } from '@pos/pos.queries';

const { eInvoice } = posQueries;

const TTL_HOURS = Number(process.env.EINVOICE_TTL_HOURS) || 3;
const BATCH_CRON = process.env.EINVOICE_BATCH_CRON || '0 */2 * * *'; // every 2 hours

@Injectable()
export class EInvoiceBatchDispatcher {
  private readonly logger = new Logger(EInvoiceBatchDispatcher.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly queueFacade: QueueFacade,
  ) {}

  /**
   * Llamado desde EInvoiceModule.onModuleInit DESPUÉS de registrar la cola.
   * Reconcilia facturas pendientes en BD contra Redis.
   */
  async startupReconciliation(): Promise<void> {
    this.logger.log('Startup reconciliation: checking for orphaned pending invoices...');
    await this.dispatchPendingInvoices();
  }

  @Cron(BATCH_CRON)
  async dispatchPendingInvoices(): Promise<void> {
    const ttlInterval = `${TTL_HOURS} hours`;

    const { rows: pendingInvoices } = await this.db.query(
      eInvoice.getPendingInvoicesForBatch,
      [ttlInterval],
    );

    if (!pendingInvoices.length) {
      this.logger.debug('No pending invoices to dispatch');
      return;
    }

    // Protect against duplicates: check which invoices already have active jobs
    const activeJobs = await this.queueFacade.getActiveJobs(EINVOICE_STATUS_QUEUE);
    const activeInvoiceIds = new Set(
      activeJobs.map((j) => j.data?.electronicInvoiceId),
    );

    let enqueued = 0;

    for (const invoice of pendingInvoices) {
      if (activeInvoiceIds.has(invoice.electronic_sale_invoice_id)) {
        continue;
      }

      const jobData: IEInvoiceJobData = {
        electronicInvoiceId: invoice.electronic_sale_invoice_id,
        keyNumber: invoice.key_number,
        tenantId: invoice.tenant_id,
        createdAt: invoice.created_at,
      };

      await this.queueFacade.enqueue(EINVOICE_STATUS_QUEUE, 'check-status', jobData);
      enqueued++;
    }

    this.logger.log(
      `Dispatched ${enqueued}/${pendingInvoices.length} invoices to queue (${activeInvoiceIds.size} already active)`,
    );
  }
}
