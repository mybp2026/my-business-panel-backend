import { Injectable, Logger } from '@nestjs/common';
import {
  HaciendaPayload,
  HaciendaStatusResponse,
  TokenCache,
} from '../interface';
import { ITenantHaciendaCredentials } from '@/contexts/general/modules/tenant_hacienda_config/tenant-hacienda-config.interface';

@Injectable()
export class HaciendaService {
  private readonly logger = new Logger(HaciendaService.name);
  private readonly tokenCacheByTenant = new Map<string, TokenCache>();

  private get apiUrl(): string {
    const url = process.env.EINVOICE_API_URL;
    if (!url) throw new Error('EINVOICE_API_URL no configurado');
    return url.endsWith('/') ? url : `${url}/`;
  }

  private async getAccessToken(
    tenantId: string,
    credentials: ITenantHaciendaCredentials,
  ): Promise<string> {
    const cached = this.tokenCacheByTenant.get(tenantId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.token;
    }

    if (process.env.HACIENDA_MOCK === 'true') {
      return 'mock-access-token';
    }

    const idpUrl = process.env.HACIENDA_IDP_URL;
    if (!idpUrl) throw new Error('HACIENDA_IDP_URL no configurado');

    const res = await fetch(idpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: credentials.haciendaClientId,
        username: credentials.haciendaUsername,
        password: credentials.haciendaPassword,
        grant_type: 'password',
      }).toString(),
    });

    if (!res.ok) {
      throw new Error(
        `Error obteniendo token de Hacienda IDP para tenant ${tenantId}: ${res.status} ${await res.text()}`,
      );
    }

    const { access_token, expires_in } = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };

    this.tokenCacheByTenant.set(tenantId, {
      token: access_token,
      expiresAt: Date.now() + (expires_in - 30) * 1000,
    });

    return access_token;
  }

  async sendInvoice(
    tenantId: string,
    credentials: ITenantHaciendaCredentials,
    payload: HaciendaPayload,
  ): Promise<{ accepted: boolean; message?: string }> {
    const token = await this.getAccessToken(tenantId, credentials);

    if (process.env.HACIENDA_MOCK === 'true') {
      return {
        accepted: true,
        message: 'Mock: comprobante aceptado localmente',
      };
    }

    const res = await fetch(`${this.apiUrl}recepcion`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 201) {
      return { accepted: true };
    }

    if (res.status === 422) {
      return {
        accepted: true,
        message: 'Comprobante ya recibido por Hacienda',
      };
    }

    throw new Error(
      `Hacienda rechazó la factura [${res.status}]: ${await res.text()}`,
    );
  }

  async checkInvoiceStatus(
    tenantId: string,
    credentials: ITenantHaciendaCredentials,
    clave: string,
  ): Promise<HaciendaStatusResponse> {
    const token = await this.getAccessToken(tenantId, credentials);

    if (process.env.HACIENDA_MOCK === 'true') {
      const mockMensajeHacienda = `<?xml version="1.0" encoding="UTF-8"?><MensajeHacienda><Clave>${clave}</Clave><NombreEmisor>Mock Emisor</NombreEmisor><TipoIdentificacionEmisor>01</TipoIdentificacionEmisor><NumeroCedulaEmisor>000000000</NumeroCedulaEmisor><IndEstado>aceptado</IndEstado><DetalleMensaje>Comprobante aceptado (mock local)</DetalleMensaje></MensajeHacienda>`;
      return {
        clave,
        fecha: new Date().toISOString(),
        emisor: { tipoIdentificacion: '01', numeroIdentificacion: '000000000' },
        comprobanteXml: '',
        respuestaXml: Buffer.from(mockMensajeHacienda).toString('base64'),
        indEstado: 'aceptado',
        respuestaTxt: 'Comprobante aceptado (mock local)',
      };
    }

    const res = await fetch(`${this.apiUrl}recepcion/${clave}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(
        `Error consultando estado en Hacienda [${res.status}]: ${await res.text()}`,
      );
    }

    return res.json() as Promise<HaciendaStatusResponse>;
  }
}
