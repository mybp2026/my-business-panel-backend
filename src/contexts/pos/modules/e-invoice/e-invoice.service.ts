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
import { TenantHaciendaConfigService } from '@/contexts/general/modules/tenant_hacienda_config/tenant-hacienda-config.service';
import { QueueFacade } from '@/contexts/general/modules/queue/facade/queue.facade';
import { EINVOICE_STATUS_QUEUE } from './queues/einvoice-status.queue';
import { encrypt, decrypt } from '@/common/crypto/aes-256-gcm';

const { eInvoice } = posQueries;

@Injectable()
export class EInvoiceService {
  private readonly logger = new Logger(EInvoiceService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly xmlgen: XmlGeneratorEngine,
    private readonly hacienda: HaciendaService,
    private readonly tenantHaciendaConfig: TenantHaciendaConfigService,
    private readonly queueFacade: QueueFacade,
  ) {}

  async getEInvoiceByBranch(branchId: string, tenantId: string) {
    const { rows } = await this.db.query(eInvoice.getEInvoicesByBranch, [
      branchId,
      tenantId,
    ]);

    return rows.map(this.decryptInvoiceRow);
  }

  async getEInvoiceForSale(saleId: string, tenantId: string) {
    const { rows } = await this.db.query(eInvoice.getEInvoiceForSale, [
      saleId,
      tenantId,
    ]);

    return rows.map(this.decryptInvoiceRow);
  }

  async getEInvoiceById(invoiceId: string, tenantId: string) {
    const { rows } = await this.db.query(eInvoice.getEInvoiceById, [
      invoiceId,
      tenantId,
    ]);
    return rows[0] ? this.decryptInvoiceRow(rows[0]) : undefined;
  }

  private decryptInvoiceRow(row: any): any {
    return {
      ...row,
      xml_signed: row.xml_signed ? decrypt(row.xml_signed) : null,
      hacienda_response_xml: row.hacienda_response_xml
        ? decrypt(row.hacienda_response_xml)
        : null,
    };
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
      throw new BadRequestException(
        'Algunos productos no tienen código CABYS asignado',
      );
    }

    if (!sale.activity_code) {
      throw new BadRequestException(
        'El tenant no tiene un código de actividad económica configurado (campo econ_activity). ' +
        'Configúrelo con el código registrado ante Hacienda en el perfil del tenant.',
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

    const credentials = await this.tenantHaciendaConfig.getCredentials(
      sale.tenant_id,
    );
    if (!credentials)
      throw new BadRequestException(
        'Configuración de facturación electrónica incompleta',
      );

    const p12Buffer = Buffer.from(credentials.p12Base64, 'base64');
    const xmlSigned = this.xmlgen.generate(
      invoice,
      p12Buffer,
      credentials.p12Password,
    );
    const xmlSignedB64 = Buffer.from(xmlSigned).toString('base64');

    this.logger.debug(`[XML base64 sin cifrar] ${xmlSignedB64}`);

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

    // 1. Persistir en BD ANTES de enviar a Hacienda.
    //    Si el server se cae después del envío pero antes del INSERT,
    //    la factura queda fantasma en Hacienda sin registro local.
    //    Insertando primero, la reconciliación la encuentra y chequea estado.
    const { rows: invoiceRows } = await (dbClient || this.db).query(
      eInvoice.create,
      [saleId, key, consecutive, encrypt(xmlSignedB64)],
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

    // 2. Enviar a Hacienda. Si falla, el registro ya existe en BD
    //    con status=1 (pendiente). El worker lo chequeará igualmente.
    //    Si Hacienda nunca lo recibió, eventualmente hará timeout (status=4).
    //    Si Hacienda responde 422 (duplicado), se trata como éxito.
    try {
      await this.hacienda.sendInvoice(
        sale.tenant_id,
        credentials,
        haciendaPayload,
      );
    } catch (sendError) {
      this.logger.error(
        `Error enviando a Hacienda (registro ya en BD): ${sendError}`,
      );
      // No relanzamos: el registro existe, el worker chequeará si Hacienda lo recibió
    }

    // 3. Enqueue job para chequear estado
    const initialDelay =
      Number(process.env.EINVOICE_INITIAL_CHECK_DELAY_MS) || 5 * 60 * 1000;
    await this.queueFacade.enqueue(
      EINVOICE_STATUS_QUEUE,
      'check-status',
      {
        electronicInvoiceId,
        keyNumber: key,
        tenantId: sale.tenant_id,
        createdAt: new Date().toISOString(),
      },
      { delay: initialDelay },
    );

    return {
      electronicInvoiceId,
      key,
      qr,
      haciendaEstado: 'procesando',
    };
  }
}
