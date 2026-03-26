import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { EInvoiceService } from './e-invoice.service';
import { XmlGeneratorEngine } from './engine/xml_generator.engine';
import { HaciendaService } from './hacienda/hacienda.service';
import { EInvoiceStatusProcessor } from './queues/einvoice-status.processor';
import { EInvoiceBatchDispatcher } from './queues/einvoice-batch.dispatcher';
import { QueueFacade } from '@/contexts/general/modules/queue/facade/queue.facade';
import { einvoiceStatusQueueConfig } from './queues/einvoice-status.queue';

@Module({
  providers: [
    EInvoiceService,
    XmlGeneratorEngine,
    HaciendaService,
    EInvoiceStatusProcessor,
    EInvoiceBatchDispatcher,
  ],
  exports: [EInvoiceService],
})
export class EInvoiceModule implements OnModuleInit {
  constructor(private readonly queueFacade: QueueFacade) {}

  onModuleInit() {
    this.queueFacade.registerQueue(einvoiceStatusQueueConfig);
  }
}
