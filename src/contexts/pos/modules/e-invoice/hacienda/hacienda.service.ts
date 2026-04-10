import { Injectable, Logger } from '@nestjs/common';
import {
  HaciendaPayload,
  HaciendaStatusResponse,
  TokenCache,
} from '../interface';

@Injectable()
export class HaciendaService {
  private readonly logger = new Logger(HaciendaService.name);
  private tokenCache: TokenCache | null = null;

  private get apiUrl(): string {
    const url = process.env.EINVOICE_API_URL;
    if (!url) throw new Error('EINVOICE_API_URL no configurado');
    return url.endsWith('/') ? url : `${url}/`;
  }

  /**
   * Decodifica un JWT para inspeccionar su contenido (sin verificar firma).
   * Útil para diagnóstico y debugging.
   */
  private decodeJWT(token: string): {
    header: any;
    payload: any;
    valid: boolean;
  } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { header: null, payload: null, valid: false };
      }

      const header = JSON.parse(
        Buffer.from(parts[0], 'base64').toString('utf-8'),
      );
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8'),
      );

      return { header, payload, valid: true };
    } catch (e) {
      this.logger.warn(`Error decodificando JWT: ${(e as Error).message}`);
      return { header: null, payload: null, valid: false };
    }
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

    this.logger.debug(`Solicitando token a IDP: ${idpUrl}`);
    this.logger.debug(`Cliente: ${clientId}, Usuario: ${username}`);

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
      const errorBody = await res.text();
      this.logger.error(
        `Error obteniendo token de Hacienda IDP [${res.status}]: ${errorBody}`,
      );
      throw new Error(
        `Error obteniendo token de Hacienda IDP: ${res.status} ${errorBody}`,
      );
    }

    const responseData = (await res.json()) as {
      access_token: string;
      expires_in: number;
      [key: string]: any;
    };

    const { access_token, expires_in } = responseData;

    this.logger.log(
      `✓ Token obtenido de Hacienda IDP. Expira en: ${expires_in}s`,
    );
    this.logger.debug(`Token length: ${access_token?.length || 0} caracteres`);
    this.logger.debug(`Token data: ${access_token || 'N/A'}`);

    // Intentar decodificar como JWT si es posible
    const jwtDecoded = this.decodeJWT(access_token);
    if (jwtDecoded.valid) {
      this.logger.debug(`Token es un JWT válido`);
      this.logger.debug(`JWT Header: ${JSON.stringify(jwtDecoded.header)}`);
      this.logger.debug(
        `JWT Payload: ${JSON.stringify(jwtDecoded.payload, null, 2)}`,
      );
    } else {
      this.logger.debug(
        `Token NO es un JWT válido (no tiene estructura HS256)`,
      );
    }

    // Campos adicionales en la respuesta
    const additionalFields = Object.keys(responseData).filter(
      (k) => k !== 'access_token' && k !== 'expires_in',
    );
    if (additionalFields.length > 0) {
      this.logger.debug(
        `Campos adicionales en respuesta del IDP: ${additionalFields.join(', ')}`,
      );
      additionalFields.forEach((field) => {
        this.logger.debug(`  ${field}: ${responseData[field]}`);
      });
    }

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
      this.logger.log('Modo MOCK habilitado - comprobante aceptado localmente');
      return {
        accepted: true,
        message: 'Mock: comprobante aceptado localmente',
      };
    }

    const trimmedToken = token.trim();
    const authorizationHeader = `bearer ${trimmedToken}`;

    this.logger.log(`Enviando comprobante a Hacienda...`);
    this.logger.debug(`Endpoint: ${this.apiUrl}recepcion`);
    this.logger.debug(`Token length: ${trimmedToken.length} caracteres`);
    this.logger.debug(
      `Primeros 50 caracteres del token: ${trimmedToken.substring(0, 50)}...`,
    );
    this.logger.debug(
      `Authorization header: ${authorizationHeader.substring(0, 100)}...`,
    );

    // Log del payload (sin comprobanteXml que es muy grande)
    const payloadLog = {
      clave: payload.clave,
      fecha: payload.fecha,
      emisor: payload.emisor,
      receptor: payload.receptor,
      comprobanteXml: `[Base64 - ${payload.comprobanteXml.length} caracteres]`,
    };
    this.logger.debug(`Payload: ${JSON.stringify(payloadLog, null, 2)}`);

    const res = await fetch(`${this.apiUrl}recepcion`, {
      method: 'POST',
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const errorText =
      res.status !== 201 && res.status !== 422 ? await res.text() : '';

    this.logger.log(`Respuesta de Hacienda: ${res.status}`);

    if (res.status !== 201 && res.status !== 422) {
      this.logger.error(`Hacienda rechazó la solicitud [${res.status}]`);
      this.logger.error(
        `Response headers: ${JSON.stringify(Object.fromEntries(res.headers.entries()))}`,
      );
      this.logger.error(`Response body: ${errorText}`);
    }

    if (res.status === 201) {
      this.logger.log('✓ Comprobante aceptado por Hacienda (201)');
      return { accepted: true };
    }

    // 422 = comprobante ya recibido (envío duplicado); Hacienda lo trata como ok
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

    const authHeader = `bearer ${token.trim()}`;
    this.logger.debug(
      `Consultando estado de comprobante [${clave}] en Hacienda`,
    );
    this.logger.debug(`Endpoint: ${this.apiUrl}recepcion/${clave}`);

    const res = await fetch(`${this.apiUrl}recepcion/${clave}`, {
      headers: { Authorization: authHeader },
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

    const response = (await res.json()) as HaciendaStatusResponse;
    this.logger.log(
      `✓ Estado del comprobante [${clave}]: ${response.indEstado}`,
    );
    return response;
  }
}
