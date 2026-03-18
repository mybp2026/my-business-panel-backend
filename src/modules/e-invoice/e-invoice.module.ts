import { Module } from '@nestjs/common';
import { EInvoiceService } from './e-invoice.service';
import { XmlGeneratorEngine } from './engine/xml_generator.engine';
import { HaciendaService } from './hacienda/hacienda.service';

@Module({
  providers: [EInvoiceService, XmlGeneratorEngine, HaciendaService],
  exports: [EInvoiceService],
})
export class EInvoiceModule {}
