import Decimal from 'decimal.js';

export interface EInvoice {
  clave: string;
  codigoActividad: string;
  numeroConsecutivo: string;
  fechaEmision: string;
  emisor: IEmisor;
  receptor?: IReceptor;
  condicionVenta: string;
  plazoVenta?: string;
  medioPago: string[];
  detalle: IDetailLine[];
  resumenFactura: IInvoiceResume;
}

export interface IIdentification {
  tipo: string;
  numero: string;
}

export interface IUbication {
  provincia: string;
  canton: string;
  distrito: string;
  otrasSenas: string;
}

export interface IEmisor {
  nombre: string;
  identificacion: IIdentification;
  nombreComercial?: string;
  ubicacion: IUbication;
  telefono: {
    codigoPais: string;
    numero: string;
  };
  correoElectronico: string;
}

export interface IReceptor {
  nombre: string;
  identificacion: IIdentification;
  identificacionExtranjero?: string;
  correoElectronico: string;
}

export interface IDetailLine {
  numeroLinea: number;
  partidaArancelaria?: string;
  codigo: string;
  cantidad: Decimal;
  unidadMedida: string;
  detalle: string;
  precioUnitario: Decimal;
  montoTotal: Decimal;
  descuento?: {
    monto: Decimal;
    naturaleza: string;
  };
  subTotal: Decimal;
  impuestos?: ITax[];
  montoTotalLinea: Decimal;
}

export interface ITax {
  codigo: string;
  codigoTarifa: string;
  tarifa: Decimal;
  monto: Decimal;
}

export interface IInvoiceResume {
  codigoMoneda: string;
  tipoCambio: Decimal;
  totalServGravados: Decimal;
  totalServExentos: Decimal;
  totalServExonerados: Decimal;
  totalMercanciasGravadas: Decimal;
  totalMercanciasExentas: Decimal;
  totalMercanciasExoneradas: Decimal;
  totalGravados: Decimal;
  totalExentos: Decimal;
  totalExonerados: Decimal;
  totalVenta: Decimal;
  totalDescuentos: Decimal;
  totalVentaNeta: Decimal;
  totalImpuestos: Decimal;
  totalComprobante: Decimal;
}
