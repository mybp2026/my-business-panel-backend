import { Module, OnModuleInit } from '@nestjs/common';
import { EInvoiceService } from './e-invoice.service';
import { XmlGeneratorEngine } from './engine/xml_generator.engine';
import { HaciendaService } from './hacienda/hacienda.service';
import { EInvoiceStatusProcessor } from './queues/einvoice-status.processor';
import { EInvoiceBatchDispatcher } from './queues/einvoice-batch.dispatcher';
import { EInvoiceStatusWorker } from './queues/einvoice-status.worker';
import { EInvoiceReconciliationCron } from './queues/einvoice-reconciliation.cron';
import { QueueFacade } from '@/contexts/general/modules/queue/facade/queue.facade';
import { einvoiceStatusQueueConfig } from './queues/einvoice-status.queue';
import { TenantHaciendaConfigModule } from '@/contexts/general/modules/tenant_hacienda_config/tenant-hacienda-config.module';

@Module({
  imports: [TenantHaciendaConfigModule],
  providers: [
    EInvoiceService,
    XmlGeneratorEngine,
    HaciendaService,
    EInvoiceStatusProcessor,
    EInvoiceBatchDispatcher,
    EInvoiceStatusWorker,
    EInvoiceReconciliationCron,
  ],
  exports: [EInvoiceService],
})
export class EInvoiceModule implements OnModuleInit {
  constructor(private readonly queueFacade: QueueFacade) {}

  onModuleInit() {
    this.queueFacade.registerQueue(einvoiceStatusQueueConfig);
  }
}
