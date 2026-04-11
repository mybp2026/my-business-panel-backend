export interface HaciendaPayload {
  clave: string;
  fecha: string;
  emisor: {
    tipoIdentificacion: string;
    numeroIdentificacion: string;
  };
  receptor?: {
    tipoIdentificacion: string;
    numeroIdentificacion: string;
  };
  comprobanteXml: string;
}

export interface HaciendaStatusResponse {
  clave: string;
  fecha: string;
  emisor: { tipoIdentificacion: string; numeroIdentificacion: string };
  receptor?: { tipoIdentificacion: string; numeroIdentificacion: string };
  comprobanteXml: string;
  respuestaXml?: string;
  indEstado: 'recibido' | 'procesando' | 'aceptado' | 'rechazado';
  respuestaTxt?: string;
}

export interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}
