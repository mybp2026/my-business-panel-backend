import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { posQueries } from '@pos/pos.queries';
import { XmlGeneratorEngine } from './engine/xml_generator.engine';
import { HaciendaService } from './hacienda/hacienda.service';
import { HaciendaPayload } from './interface';

const { eInvoice } = posQueries;

@Injectable()
export class EInvoiceService {
  private readonly logger = new Logger(EInvoiceService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly xmlgen: XmlGeneratorEngine,
    private readonly hacienda: HaciendaService,
  ) {}

  async getEInvoiceByBranch(branchId: string) {
    const { rows } = await this.db.query(eInvoice.getEInvoicesByBranch, [
      branchId,
    ]);

    return rows;
  }

  async getEInvoiceForSale(saleId: string) {
    const { rows } = await this.db.query(eInvoice.getEInvoiceForSale, [saleId]);

    return rows;
  }

  async getEInvoiceById(invoiceId: string) {
    const { rows } = await this.db.query(eInvoice.getEInvoiceById, [invoiceId]);
    return rows[0];
  }

  // TODO: manejar transaccion con método db.transaction()
  async createEInvoiceForSale(saleId: string, dbClient?: any) {
    const { rows: saleRows } = await (dbClient || this.db).query(
      eInvoice.getSaleForEInvoice,
      [saleId],
    );

    if (!saleRows.length) throw new BadRequestException('Venta no encontrada');

    const sale = saleRows[0];

    if (!sale.is_completed)
      throw new BadRequestException('La venta no está completada');
    if (sale.already_invoiced)
      throw new BadRequestException('Esta venta ya tiene factura electrónica');

    const { rows: digitalRows } = await (dbClient || this.db).query(
      eInvoice.getDInvoice,
      [saleId],
    );
    if (!digitalRows.length)
      throw new BadRequestException(
        'La venta no tiene factura digital generada',
      );

    const { rows: items } = await (dbClient || this.db).query(
      eInvoice.getSaleItemsForEInvoice,
      [saleId],
    );

    if (!items.length) throw new BadRequestException('La venta no tiene items');

    const itemsWithoutCabys = items.filter((i: any) => !i.cabys_code);
    if (itemsWithoutCabys.length > 0) {
      const ids = itemsWithoutCabys
        .map((i: any) => i.product_variant_id)
        .join(', ');
      throw new BadRequestException(
        `Los siguientes productos no tienen código CABYS asignado: ${ids}`,
      );
    }

    const { rows: seqRows } = await (dbClient || this.db).query(
      eInvoice.getNextInvoiceSequence,
      [sale.branch_id],
    );
    const invoiceSequence = Number(seqRows[0].next_seq);

    const consecutive = this.xmlgen.generateConsecutive(
      '01',
      sale.terminal_number ?? 1,
      sale.pos_number ?? 1,
      invoiceSequence,
    );

    const { key, qr } = this.xmlgen.generateClave(
      sale.issuer_identification,
      consecutive,
    );

    const invoice = this.xmlgen.mapSaleToEInvoice(
      sale,
      items,
      key,
      consecutive,
    );
    const p12Base64 = process.env.EINVOICE_P12_BASE64;
    const p12Pass = process.env.EINVOICE_P12_PASSWORD;

    if (!p12Base64 || !p12Pass)
      throw new Error('Variables de entorno del certificado no configuradas');

    const p12Buffer = Buffer.from(p12Base64, 'base64');
    const xmlSigned = this.xmlgen.generate(invoice, p12Buffer, p12Pass);
    const xmlSignedB64 = Buffer.from(xmlSigned).toString('base64');

    const haciendaPayload: HaciendaPayload = {
      clave: key,
      fecha: invoice.fechaEmision,
      emisor: {
        tipoIdentificacion: invoice.emisor.identificacion.tipo,
        numeroIdentificacion: invoice.emisor.identificacion.numero,
      },
      ...(invoice.receptor && {
        receptor: {
          tipoIdentificacion: invoice.receptor.identificacion.tipo,
          numeroIdentificacion: invoice.receptor.identificacion.numero,
        },
      }),
      comprobanteXml: xmlSignedB64,
    };

    await this.hacienda.sendInvoice(haciendaPayload);

    const { rows: invoiceRows } = await (dbClient || this.db).query(
      eInvoice.create,
      [saleId, key, consecutive, xmlSignedB64],
    );
    const electronicInvoiceId = invoiceRows[0].electronic_sale_invoice_id;

    for (const item of items) {
      await (dbClient || this.db).query(eInvoice.insertItem, [
        electronicInvoiceId,
        item.tenant_id,
        item.product_variant_id,
        item.sale_item_id,
        item.line_number,
        item.discount_amount ?? 0,
      ]);
    }

    await (dbClient || this.db).query(eInvoice.markSaleAsEInvoiced, [saleId]);

    // La resolución del estado se delega al batch dispatcher + worker.
    // El próximo ciclo (cada 2hrs) recogerá esta factura y consultará Hacienda.
    return {
      electronicInvoiceId,
      key,
      qr,
      haciendaEstado: 'procesando',
    };
  }
}
