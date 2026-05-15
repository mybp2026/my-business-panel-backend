import { Module } from '@nestjs/common';
import { EInvoiceService } from './e-invoice.service';
import { XmlGeneratorEngine } from './engine/xml_generator.engine';
import { HaciendaService } from './hacienda/hacienda.service';
import { EInvoiceStatusCron } from './cron/einvoice-status.cron';
import { TenantHaciendaConfigModule } from '@/contexts/general/modules/tenant_hacienda_config/tenant-hacienda-config.module';

@Module({
  imports: [TenantHaciendaConfigModule],
  providers: [
    EInvoiceService,
    XmlGeneratorEngine,
    HaciendaService,
    EInvoiceStatusCron,
  ],
  exports: [EInvoiceService],
})
export class EInvoiceModule {}
