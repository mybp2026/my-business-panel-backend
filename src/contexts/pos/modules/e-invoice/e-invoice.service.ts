import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { posQueries } from '@pos/pos.queries';
import { XmlGeneratorEngine } from './engine/xml_generator.engine';
import { HaciendaService } from './hacienda/hacienda.service';
import { HaciendaPayload, HaciendaStatusResponse } from './interface';

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

  // TODO:  manejar transaccion con método db.transaction()
  // TODO:  al enviar la factura a Hacienda, no se recibe un resultado inmediato, sino que se procesa asincrónicamente. Implementar un mecanismo de polling o webhook para actualizar el estado de la factura una vez que Hacienda la procese. actualmente se hace un intento de quick-poll a los 3s, y luego se reintenta con backoff exponencial cada vez que el cron job la vuelva a consultar. sin embargo, el backoff exponencial reintenta cada un minuto. idealmente, el primer reintento debería ser a los 2 minutos, luego 4, luego 8, etc. hasta un máximo de n minutos. la idea es no tener al sistema preguntando cada minuto de forma indefinida. igualmente, no deberia preguntarse a haciend si no existen facturas pendientes de resolver.
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

    // Usa invoice.fechaEmision directamente → coincide exactamente con el XML.
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

    // Insertar con status pendiente (1).
    // next_check_at = NOW()+30s: baseline para el cron si el quick-poll no resuelve.
    const { rows: invoiceRows } = await (dbClient || this.db).query(
      eInvoice.create,
      [saleId, key, consecutive, xmlSignedB64],
    );
    const electronicInvoiceId = invoiceRows[0].electronic_sale_invoice_id;

    // Opción A — Quick-poll: esperar 3s y hacer un único intento de resolución.
    // Si Hacienda ya procesó el comprobante, persiste el estado final aquí mismo.
    // Si aún está procesando, el cron (Opción C) retomará con backoff exponencial.
    let indEstado = 'recibido';
    let statusId = 1;
    let respuestaTxt: string | undefined;
    try {
      await this.sleep(3000);
      const haciendaStatus: HaciendaStatusResponse =
        await this.hacienda.checkInvoiceStatus(key);
      indEstado = haciendaStatus.indEstado;
      respuestaTxt = haciendaStatus.respuestaTxt;
      statusId = this.mapIndEstadoToStatusId(indEstado);

      if (statusId !== 1) {
        // Resuelto en el primer intento: persistir estado final directamente
        await (dbClient || this.db).query(eInvoice.updateHaciendaResponse, [
          electronicInvoiceId,
          haciendaStatus.respuestaXml ?? null,
          statusId,
        ]);
      } else {
        // Aún procesando: registrar intento #1 y reprogramar con backoff
        await (dbClient || this.db).query(eInvoice.updateCheckAttempt, [
          electronicInvoiceId,
          1,
          this.nextCheckAt(1),
        ]);
      }
    } catch (pollErr) {
      // Si el quick-poll falla (red, timeout de Hacienda), el cron retomará
      // usando el next_check_at=NOW()+30s que quedó del INSERT.
      console.error('Quick-poll fallido, el cron reintentará:', pollErr);
    }

    if (statusId === 3) {
      throw new Error(
        `Hacienda rechazó el comprobante: ${respuestaTxt ?? 'sin detalle'}`,
      );
    }

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

    return {
      electronicInvoiceId,
      key,
      qr,
      haciendaEstado: indEstado,
    };
  }

  /**
   * Cron job que se ejecuta cada minuto para verificar facturas electrónicas pendientes.
   * Delega en reconcilePendingInvoices() para mantener la lógica de negocio centralizada.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handlePendingInvoices(): Promise<void> {
    this.logger.debug('Verificando facturas electrónicas pendientes...');
    await this.reconcilePendingInvoices();
  }

  /**
   * Opción C — consultado por el cron cada minuto.
   * Procesa hasta 100 facturas pendientes cuyo next_check_at ya venció,
   * actualizando su estado o reagendando con backoff exponencial.
   */
  async reconcilePendingInvoices(dbClient?: any): Promise<void> {
    const { rows } = await (dbClient || this.db).query(
      eInvoice.getPendingInvoices,
    );

    for (const invoice of rows) {
      try {
        const haciendaStatus: HaciendaStatusResponse =
          await this.hacienda.checkInvoiceStatus(invoice.key_number);
        const statusId = this.mapIndEstadoToStatusId(haciendaStatus.indEstado);

        if (statusId !== 1) {
          // Resuelto (aceptado o rechazado): persistir estado final
          await (dbClient || this.db).query(eInvoice.updateHaciendaResponse, [
            invoice.electronic_sale_invoice_id,
            haciendaStatus.respuestaXml ?? null,
            statusId,
          ]);
        } else {
          const attempts: number = Number(invoice.check_attempts) + 1;
          if (attempts >= 20) {
            // Sin respuesta tras 20 intentos (~7.5h): marcar como timeout (status 4)
            await (dbClient || this.db).query(eInvoice.updateHaciendaResponse, [
              invoice.electronic_sale_invoice_id,
              null,
              4,
            ]);
          } else {
            await this.db.query(eInvoice.updateCheckAttempt, [
              invoice.electronic_sale_invoice_id,
              attempts,
              this.nextCheckAt(attempts),
            ]);
          }
        }
      } catch (err) {
        console.error(`Error al verificar factura ${invoice.key_number}:`, err);
      }
    }
  }

  private mapIndEstadoToStatusId(indEstado: string): number {
    switch (indEstado) {
      case 'aceptado':
        return 2;
      case 'rechazado':
        return 3;
      default:
        return 1; // 'recibido' | 'procesando' → pendiente
    }
  }

  /** Espera no-bloqueante. */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calcula el próximo intento con backoff exponencial:
   * delay = min(0.5 × 2^attempt, 30) minutos.
   *
   * | attempt | delay  |
   * |---------|--------|
   * | 1       | 1 min  |
   * | 2       | 2 min  |
   * | 3       | 4 min  |
   * | 4       | 8 min  |
   * | 5       | 16 min |
   * | 6+      | 30 min |
   */
  private nextCheckAt(attempt: number): Date {
    const delayMs = Math.min(0.5 * Math.pow(2, attempt), 30) * 60 * 1000;
    return new Date(Date.now() + delayMs);
  }
}
