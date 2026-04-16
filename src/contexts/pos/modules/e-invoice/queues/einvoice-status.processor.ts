import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { HaciendaService } from '../hacienda/hacienda.service';
import { HaciendaStatusResponse } from '../interface';
import { IEInvoiceJobData } from '../interface';
import { posQueries } from '@pos/pos.queries';
import { QueueFacade } from '@/contexts/general/modules/queue/facade/queue.facade';
import { EINVOICE_STATUS_QUEUE } from './einvoice-status.queue';
import { TenantHaciendaConfigService } from '@/contexts/general/modules/tenant_hacienda_config/tenant-hacienda-config.service';
import { encrypt } from '@/common/crypto/aes-256-gcm';

const { eInvoice } = posQueries;

const REQUEUE_DELAY_MS =
  Number(process.env.EINVOICE_REQUEUE_DELAY_MS) || 2 * 60 * 60 * 1000; // default: 2 hours
const GAP_BETWEEN_JOBS_MS = Number(process.env.EINVOICE_REQUEST_GAP_MS) || 5000;
const TTL_HOURS = Number(process.env.EINVOICE_TTL_HOURS) || 3;

@Injectable()
export class EInvoiceStatusProcessor {
  private readonly logger = new Logger(EInvoiceStatusProcessor.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly hacienda: HaciendaService,
    private readonly queueFacade: QueueFacade,
    private readonly tenantHaciendaConfig: TenantHaciendaConfigService,
  ) {}

  async processJob(job: IEInvoiceJobData): Promise<void> {
    const { electronicInvoiceId, keyNumber, tenantId, createdAt } = job;

    if (this.isExpired(createdAt)) {
      this.logger.warn(
        `Job ${keyNumber} expired (TTL ${TTL_HOURS}hrs), marking as timeout`,
      );
      await this.db.query(eInvoice.updateHaciendaResponse, [
        electronicInvoiceId,
        null,
        4,
      ]);
      return;
    }

    const credentials =
      await this.tenantHaciendaConfig.getCredentials(tenantId);
    if (!credentials) {
      this.logger.error(
        `No Hacienda credentials for tenant ${tenantId}, skipping`,
      );
      return;
    }

    try {
      const status: HaciendaStatusResponse =
        await this.hacienda.checkInvoiceStatus(
          tenantId,
          credentials,
          keyNumber,
        );
      const statusId = this.mapIndEstadoToStatusId(status.indEstado);

      this.logger.debug(
        `Invoice ${keyNumber} Hacienda indEstado: "${status.indEstado}" → statusId: ${statusId}${status.respuestaTxt ? ` | msg: ${status.respuestaTxt}` : ''}`,
      );

      if (statusId !== 1) {
        // Decodificar respuestaXml para ver detalle de Hacienda (especialmente en rechazos)
        if (status.respuestaXml) {
          const decodedXml = Buffer.from(
            status.respuestaXml,
            'base64',
          ).toString('utf-8');
          this.logger.log(
            `[Hacienda respuestaXml decoded] Invoice ${keyNumber}:\n${decodedXml}`,
          );
        }

        const encryptedResponse = status.respuestaXml
          ? encrypt(status.respuestaXml)
          : null;
        await this.db.query(eInvoice.updateHaciendaResponse, [
          electronicInvoiceId,
          encryptedResponse,
          statusId,
        ]);
        this.logger.log(`Invoice ${keyNumber} resolved: ${status.indEstado}`);
      } else {
        await this.requeueJob(job);
        this.logger.debug(
          `Invoice ${keyNumber} still pending, requeued for next cycle`,
        );
      }
    } catch (err) {
      this.logger.error(`Error checking invoice ${keyNumber}: ${err}`);
      await this.requeueJob(job);
    }

    await this.sleep(GAP_BETWEEN_JOBS_MS);
  }

  private async requeueJob(job: IEInvoiceJobData): Promise<void> {
    await this.queueFacade.enqueue(EINVOICE_STATUS_QUEUE, 'check-status', job, {
      delay: REQUEUE_DELAY_MS,
    });
  }

  private isExpired(createdAt: string): boolean {
    const created = new Date(createdAt).getTime();
    const ttlMs = TTL_HOURS * 60 * 60 * 1000;
    return Date.now() - created > ttlMs;
  }

  private mapIndEstadoToStatusId(indEstado: string): number {
    switch (indEstado) {
      case 'aceptado':
        return 2;
      case 'rechazado':
        return 3;
      default:
        return 1;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
