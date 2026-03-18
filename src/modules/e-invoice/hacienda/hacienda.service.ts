import { Injectable } from '@nestjs/common';
import {
  HaciendaPayload,
  HaciendaStatusResponse,
  TokenCache,
} from '../interface';

@Injectable()
export class HaciendaService {
  private tokenCache: TokenCache | null = null;

  private get apiUrl(): string {
    const url = process.env.EINVOICE_API_URL;
    if (!url) throw new Error('EINVOICE_API_URL no configurado');
    return url.endsWith('/') ? url : `${url}/`;
  }

  /**
   * Obtiene un access token de Hacienda IDP (OAuth2 Resource Owner Password).
   * El token se cachea en memoria hasta 30 segundos antes de su expiración.
   *
   * Variables de entorno requeridas:
   *   HACIENDA_IDP_URL      — URL del token endpoint (producción o sandbox)
   *   HACIENDA_CLIENT_ID    — 'api-prod' (producción) | 'api-stag' (sandbox)
   *   HACIENDA_USERNAME     — Usuario ATV del emisor
   *   HACIENDA_PASSWORD     — Contraseña ATV del emisor
   */
  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    if (process.env.HACIENDA_MOCK === 'true') {
      return 'mock-access-token';
    }

    const idpUrl = process.env.HACIENDA_IDP_URL;
    const clientId = process.env.HACIENDA_CLIENT_ID ?? 'api-prod';
    const username = process.env.HACIENDA_USERNAME;
    const password = process.env.HACIENDA_PASSWORD;

    if (!idpUrl || !username || !password) {
      throw new Error(
        'Variables de entorno Hacienda no configuradas: HACIENDA_IDP_URL, HACIENDA_USERNAME, HACIENDA_PASSWORD',
      );
    }

    const res = await fetch(idpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        username,
        password,
        grant_type: 'password',
      }).toString(),
    });

    if (!res.ok) {
      throw new Error(
        `Error obteniendo token de Hacienda IDP: ${res.status} ${await res.text()}`,
      );
    }

    const { access_token, expires_in } = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };

    // Cache con 30 segundos de margen antes del vencimiento
    this.tokenCache = {
      token: access_token,
      expiresAt: Date.now() + (expires_in - 30) * 1000,
    };

    return this.tokenCache.token;
  }

  /**
   * Envía un comprobante al endpoint POST /recepcion de Hacienda.
   *
   * Códigos de respuesta:
   *   201 — Aceptado
   *   422 — Ya recibido anteriormente (idempotente, se trata como éxito)
   *   4xx / 5xx — Error; se lanza excepción con el cuerpo de la respuesta
   */
  async sendInvoice(
    payload: HaciendaPayload,
  ): Promise<{ accepted: boolean; message?: string }> {
    const token = await this.getAccessToken();

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

    // 422 = comprobante ya recibido (envío duplicado); Hacienda lo trata como ok
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

  /**
   * Consulta el estado de un comprobante previamente enviado.
   * GET /recepcion/{clave}
   *
   * indEstado posibles: 'recibido' | 'procesando' | 'aceptado' | 'rechazado'
   */
  async checkInvoiceStatus(clave: string): Promise<HaciendaStatusResponse> {
    const token = await this.getAccessToken();

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
