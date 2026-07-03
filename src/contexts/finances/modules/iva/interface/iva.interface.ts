export interface IvaSummaryFromDb {
  iva_debito: string;
  iva_credito: string;
  iva_cxp: string;
  iva_recuperable: string;
  iva_notas_credito: string;
  iva_debito_ajustado: string;
  iva_neto: string;
}

export interface IvaSummaryResponse {
  iva_debito: number;
  iva_credito: number;
  iva_cxp: number;
  iva_recuperable: number;
  iva_notas_credito: number;
  iva_debito_ajustado: number;
  iva_neto: number;
}
