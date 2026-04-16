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

    // if (process.env.HACIENDA_MOCK === 'true') {
    //   return 'mock-access-token';
    // }

    const idpUrl = process.env.HACIENDA_IDP_URL;
    if (!idpUrl) throw new Error('HACIENDA_IDP_URL no configurado');

    console.log(credentials);

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
      await res.text();
      this.logger.error(
        `Error obteniendo token de Hacienda IDP [${res.status}]`,
      );
      throw new Error(
        `Error obteniendo token de Hacienda IDP para tenant ${tenantId}: ${res.status}`,
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
    for (let tokenAttempt = 0; tokenAttempt < 2; tokenAttempt++) {
      const token = await this.getAccessToken(tenantId, credentials);

      const res = await this.fetchWithRetry(`${this.apiUrl}recepcion`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      this.logger.log(`Respuesta de Hacienda: ${res.status}`);

      if (res.status === 201 || res.status === 202) {
        const msg =
          res.status === 202
            ? '✓ Comprobante recibido por Hacienda (202 - en procesamiento asíncrono)'
            : '✓ Comprobante aceptado por Hacienda (201)';
        this.logger.log(msg);
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

      // 401: token expirado o inválido → limpiar cache y reintentar con token fresco
      if (res.status === 401 && tokenAttempt === 0) {
        this.logger.warn(
          'Token rechazado (401), refrescando y reintentando...',
        );
        this.tokenCacheByTenant.delete(tenantId);
        continue;
      }

      // 429: rate limit → esperar Retry-After y reintentar
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after')) || 60;
        this.logger.warn(`Rate limited (429), esperando ${retryAfter}s...`);
        await this.sleep(retryAfter * 1000);
        continue;
      }

      const errorBody = await res.text();
      this.logger.error(
        `Hacienda rechazó la solicitud [${res.status}] — body: ${errorBody}`,
      );

      throw new Error(`Hacienda rechazó la factura [${res.status}]`);
    }
    throw new Error(
      'Hacienda: no se pudo enviar la factura después de reintentos de token',
    );
  }

  async checkInvoiceStatus(
    tenantId: string,
    credentials: ITenantHaciendaCredentials,
    clave: string,
  ): Promise<HaciendaStatusResponse> {
    this.logger.debug(
      `Consultando estado de comprobante [${clave}] en Hacienda`,
    );

    for (let tokenAttempt = 0; tokenAttempt < 2; tokenAttempt++) {
      if (process.env.HACIENDA_MOCK === 'true') {
        const mockMensajeHacienda = `<?xml version="1.0" encoding="UTF-8"?><MensajeHacienda><Clave>${clave}</Clave><NombreEmisor>Mock Emisor</NombreEmisor><TipoIdentificacionEmisor>01</TipoIdentificacionEmisor><NumeroCedulaEmisor>000000000</NumeroCedulaEmisor><IndEstado>aceptado</IndEstado><DetalleMensaje>Comprobante aceptado (mock local)</DetalleMensaje></MensajeHacienda>`;
        return {
          clave,
          fecha: new Date().toISOString(),
          emisor: {
            tipoIdentificacion: '01',
            numeroIdentificacion: '000000000',
          },
          comprobanteXml: '',
          respuestaXml: Buffer.from(mockMensajeHacienda).toString('base64'),
          indEstado: 'aceptado',
          respuestaTxt: 'Comprobante aceptado (mock local)',
        };
      }

      const token = await this.getAccessToken(tenantId, credentials);

      const res = await this.fetchWithRetry(
        `${this.apiUrl}recepcion/${clave}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // 401: token expirado → limpiar cache y reintentar
      if (res.status === 401 && tokenAttempt === 0) {
        this.logger.warn(
          'Token rechazado (401) en checkStatus, refrescando...',
        );
        this.tokenCacheByTenant.delete(tenantId);
        continue;
      }

      // 429: rate limit → esperar y reintentar
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after')) || 60;
        this.logger.warn(
          `Rate limited (429) en checkStatus, esperando ${retryAfter}s...`,
        );
        await this.sleep(retryAfter * 1000);
        continue;
      }

      if (!res.ok) {
        const errorBody = await res.text();
        this.logger.error(
          `Error consultando estado en Hacienda [${res.status}]: ${errorBody}`,
        );
        throw new Error(
          `Error consultando estado en Hacienda [${res.status}]: ${errorBody}`,
        );
      }

      // Hacienda devuelve campos con guiones (ind-estado, respuesta-xml, etc.)
      const raw: Record<string, any> = await res.json();

      this.logger.log(
        `[checkInvoiceStatus] Hacienda raw response for ${clave}: ${JSON.stringify(raw)}`,
      );

      return {
        clave: raw.clave,
        fecha: raw.fecha,
        emisor: raw.emisor,
        receptor: raw.receptor,
        comprobanteXml: raw['comprobante-xml'] ?? raw.comprobanteXml,
        respuestaXml: raw['respuesta-xml'] ?? raw.respuestaXml,
        indEstado: raw['ind-estado'] ?? raw.indEstado,
        respuestaTxt: raw['respuesta-txt'] ?? raw.respuestaTxt,
      } as HaciendaStatusResponse;
    }

    throw new Error(
      'Hacienda: no se pudo consultar estado después de reintentos de token',
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
