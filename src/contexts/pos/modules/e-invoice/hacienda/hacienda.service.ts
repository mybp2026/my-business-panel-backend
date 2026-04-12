import { Injectable, Logger } from '@nestjs/common';
import {
  HaciendaPayload,
  HaciendaStatusResponse,
  TokenCache,
} from '../interface';
import { ITenantHaciendaCredentials } from '@/contexts/general/modules/tenant_hacienda_config/tenant-hacienda-config.interface';

const FETCH_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

@Injectable()
export class HaciendaService {
  private readonly logger = new Logger(HaciendaService.name);
  private readonly tokenCacheByTenant = new Map<string, TokenCache>();

  private get apiUrl(): string {
    const url = process.env.EINVOICE_API_URL;
    if (!url) throw new Error('EINVOICE_API_URL no configurado');
    return url.endsWith('/') ? url : `${url}/`;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await this.fetchWithTimeout(url, options);

        if (res.status >= 500 && attempt < MAX_RETRIES) {
          this.logger.warn(
            `Hacienda returned ${res.status}, retry ${attempt}/${MAX_RETRIES}`,
          );
          await this.sleep(1000 * attempt);
          continue;
        }

        return res;
      } catch (err: any) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          this.logger.warn(
            `Fetch failed (${err.message}), retry ${attempt}/${MAX_RETRIES}`,
          );
          await this.sleep(1000 * attempt);
        }
      }
    }

    throw lastError ?? new Error('Fetch failed after retries');
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

    const res = await this.fetchWithRetry(idpUrl, {
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
      const errorBody = await res.text();
      this.logger.error(
        `Error obteniendo token de Hacienda IDP [${res.status}]: ${errorBody}`,
      );
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
      this.logger.log('Modo MOCK habilitado - comprobante aceptado localmente');
      return {
        accepted: true,
        message: 'Mock: comprobante aceptado localmente',
      };
    }

    const res = await this.fetchWithRetry(`${this.apiUrl}recepcion`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const errorText =
      res.status !== 201 && res.status !== 202 && res.status !== 422
        ? await res.text()
        : '';

    this.logger.log(`Respuesta de Hacienda: ${res.status}`);

    if (res.status !== 201 && res.status !== 202 && res.status !== 422) {
      this.logger.error(`Hacienda rechazó la solicitud [${res.status}]`);
      this.logger.error(
        `Response headers: ${JSON.stringify(Object.fromEntries(res.headers.entries()))}`,
      );
      this.logger.error(`Response body: ${errorText}`);
    }

    if (res.status === 201 || res.status === 202) {
      this.logger.log(`✓ Comprobante aceptado por Hacienda (${res.status})`);
      return { accepted: true };
    }

    if (res.status === 422) {
      this.logger.log(
        '✓ Comprobante ya recibido por Hacienda (422 - duplicado)',
      );
      return {
        accepted: true,
        message: 'Comprobante ya recibido por Hacienda',
      };
    }

    throw new Error(
      `Hacienda rechazó la factura [${res.status}]: ${errorText}`,
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

    const authHeader = `bearer ${token.trim()}`;
    this.logger.debug(
      `Consultando estado de comprobante [${clave}] en Hacienda`,
    );
    this.logger.debug(`Endpoint: ${this.apiUrl}recepcion/${clave}`);

    const res = await this.fetchWithRetry(`${this.apiUrl}recepcion/${clave}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      this.logger.error(
        `Error consultando estado en Hacienda [${res.status}]: ${errorBody}`,
      );
      throw new Error(
        `Error consultando estado en Hacienda [${res.status}]: ${errorBody}`,
      );
    }

    return res.json() as Promise<HaciendaStatusResponse>;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
