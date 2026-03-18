import { Injectable } from '@nestjs/common';
import { EInvoice } from '../interface/e-invoice.interface';
import Decimal from 'decimal.js';
import { create } from 'xmlbuilder2';
// import * as fs from 'fs';
// import * as path from 'path';
import * as crypto from 'crypto';
import encodeQR from 'qr';
import * as forge from 'node-forge';
import { SignedXml } from 'xml-crypto';

@Injectable()
export class XmlGeneratorEngine {
  /**
   * Punto de entrada principal del engine.
   * Orquesta buildXml() → signXML() y retorna el XML firmado en texto plano.
   * El llamador convierte a base64 para almacenamiento: Buffer.from(result).toString('base64')
   */
  generate(eInvoice: EInvoice, p12Buffer: Buffer, p12Password: string): string {
    const xmlPlain = this.buildXml(eInvoice);
    return this.signXML(xmlPlain, p12Buffer, p12Password);
  }

  buildXml(content: EInvoice): string {
    const xml = create({ version: '1.0', encoding: 'utf-8' }).ele(
      'FacturaElectronica',
      {
        xmlns:
          'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica',
        'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
        'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
        version: '4.4',
      },
    );

    xml
      .ele('Clave')
      .txt(content.clave)
      .up()
      .ele('CodigoActividad')
      .txt(content.codigoActividad)
      .up()
      .ele('NumeroConsecutivo')
      .txt(content.numeroConsecutivo)
      .up()
      .ele('FechaEmision')
      .txt(content.fechaEmision)
      .up();

    const emisor = xml.ele('Emisor');
    emisor.ele('Nombre').txt(content.emisor.nombre).up();
    const identEmisor = emisor.ele('Identificacion');
    identEmisor.ele('Tipo').txt(content.emisor.identificacion.tipo).up();
    identEmisor.ele('Numero').txt(content.emisor.identificacion.numero).up();
    identEmisor.up();
    const ubicacion = emisor.ele('Ubicacion');
    ubicacion.ele('Provincia').txt(content.emisor.ubicacion.provincia).up();
    ubicacion.ele('Canton').txt(content.emisor.ubicacion.canton).up();
    ubicacion.ele('Distrito').txt(content.emisor.ubicacion.distrito).up();
    ubicacion.ele('OtrasSenas').txt(content.emisor.ubicacion.otrasSenas).up();
    ubicacion.up();
    if (content.emisor.telefono?.numero) {
      const tel = emisor.ele('Telefono');
      tel.ele('CodigoPais').txt(content.emisor.telefono.codigoPais).up();
      tel.ele('NumTelefono').txt(content.emisor.telefono.numero).up();
      tel.up();
    }
    emisor.ele('CorreoElectronico').txt(content.emisor.correoElectronico).up();
    emisor.up();

    if (content.receptor) {
      const receptor = xml.ele('Receptor');
      receptor.ele('Nombre').txt(content.receptor.nombre).up();
      const identRec = receptor.ele('Identificacion');
      identRec.ele('Tipo').txt(content.receptor.identificacion.tipo).up();
      identRec.ele('Numero').txt(content.receptor.identificacion.numero).up();
      identRec.up();
      receptor
        .ele('CorreoElectronico')
        .txt(content.receptor.correoElectronico)
        .up();
      receptor.up();
    }

    xml.ele('CondicionVenta').txt(content.condicionVenta).up();
    if (content.plazoVenta) xml.ele('PlazoVenta').txt(content.plazoVenta).up();
    content.medioPago.forEach((medio) => xml.ele('MedioPago').txt(medio).up());

    const detalleNode = xml.ele('DetalleServicio');
    for (const line of content.detalle) {
      const linea = detalleNode.ele('LineaDetalle');
      linea.ele('NumeroLinea').txt(line.numeroLinea.toString()).up();
      if (line.partidaArancelaria)
        linea.ele('PartidaArancelaria').txt(line.partidaArancelaria).up();

      linea.ele('CodigoCABYS').txt(line.codigo).up();

      linea.ele('Cantidad').txt(line.cantidad.toFixed(5)).up();
      linea.ele('UnidadMedida').txt(line.unidadMedida).up();
      linea.ele('Detalle').txt(line.detalle).up();
      linea.ele('PrecioUnitario').txt(line.precioUnitario.toFixed(5)).up();
      linea.ele('MontoTotal').txt(line.montoTotal.toFixed(5)).up();

      if (line.descuento) {
        const desc = linea.ele('Descuento');
        desc.ele('MontoDescuento').txt(line.descuento.monto.toFixed(5)).up();
        desc.ele('NaturalezaDescuento').txt(line.descuento.naturaleza).up();
        desc.up();
      }

      linea.ele('SubTotal').txt(line.subTotal.toFixed(5)).up();

      if (line.impuestos && line.impuestos.length > 0) {
        line.impuestos.forEach((tax) => {
          const imp = linea.ele('Impuesto');
          imp.ele('Codigo').txt(tax.codigo).up();
          imp.ele('CodigoTarifa').txt(tax.codigoTarifa).up();
          imp.ele('Tarifa').txt(tax.tarifa.toFixed(2)).up();
          imp.ele('Monto').txt(tax.monto.toFixed(5)).up();
          imp.up();
        });
      }

      linea.ele('MontoTotalLinea').txt(line.montoTotalLinea.toFixed(5)).up();
      linea.up();
    }
    detalleNode.up();

    const res = xml.ele('ResumenFactura');
    const mon = res.ele('CodigoTipoMoneda');
    mon.ele('CodigoMoneda').txt(content.resumenFactura.codigoMoneda).up();
    mon
      .ele('TipoCambio')
      .txt(content.resumenFactura.tipoCambio.toFixed(5))
      .up();
    mon.up();

    res
      .ele('TotalServGravados')
      .txt(content.resumenFactura.totalServGravados.toFixed(5))
      .up()
      .ele('TotalServExentos')
      .txt(content.resumenFactura.totalServExentos.toFixed(5))
      .up()
      .ele('TotalServExonerados')
      .txt(content.resumenFactura.totalServExonerados.toFixed(5))
      .up()
      .ele('TotalMercanciasGravadas')
      .txt(content.resumenFactura.totalMercanciasGravadas.toFixed(5))
      .up()
      .ele('TotalMercanciasExentas')
      .txt(content.resumenFactura.totalMercanciasExentas.toFixed(5))
      .up()
      .ele('TotalMercanciasExoneradas')
      .txt(content.resumenFactura.totalMercanciasExoneradas.toFixed(5))
      .up()
      .ele('TotalGravados')
      .txt(content.resumenFactura.totalGravados.toFixed(5))
      .up()
      .ele('TotalExentos')
      .txt(content.resumenFactura.totalExentos.toFixed(5))
      .up()
      .ele('TotalExonerados')
      .txt(content.resumenFactura.totalExonerados.toFixed(5))
      .up()
      .ele('TotalVenta')
      .txt(content.resumenFactura.totalVenta.toFixed(5))
      .up()
      .ele('TotalDescuentos')
      .txt(content.resumenFactura.totalDescuentos.toFixed(5))
      .up()
      .ele('TotalVentaNeta')
      .txt(content.resumenFactura.totalVentaNeta.toFixed(5))
      .up()
      .ele('TotalImpuesto')
      .txt(content.resumenFactura.totalImpuestos.toFixed(5))
      .up()
      .ele('TotalComprobante')
      .txt(content.resumenFactura.totalComprobante.toFixed(5))
      .up();
    res.up();

    const xmlString = xml.end({ prettyPrint: true });

    // // Auditoría: escritura no-bloqueante (fire-and-forget)
    // const templateDir = path.join(
    //   process.cwd(),
    //   'src',
    //   'modules',
    //   'e-invoice',
    //   'templates',
    // );
    // const auditPath = path.join(
    //   templateDir,
    //   `invoice_${content.numeroConsecutivo}.xml`,
    // );
    // fs.promises
    //   .mkdir(templateDir, { recursive: true })
    //   .then(() => fs.promises.writeFile(auditPath, xmlString))
    //   .catch((err) => console.error('Error writing audit XML:', err));

    // Retorna XML plano. El llamador firma con signXML() y luego codifica a base64 para almacenar.
    return xmlString;
  }

  /**
   * Firma el XML con una firma XAdES-BES enveloped (RSA-SHA256), según DGT-R-48-2016.
   *
   * El certificado .p12 NUNCA debe hardcodearse. El llamador debe cargarlo
   * desde variables de entorno o un vault:
   *
   *   const p12Buffer = Buffer.from(process.env.EINVOICE_P12_BASE64, 'base64');
   *   const signed = engine.signXML(xml, p12Buffer, process.env.EINVOICE_P12_PASSWORD);
   *   // Para almacenar en xml_signed:
   *   const xmlSignedB64 = Buffer.from(signed).toString('base64');
   *
   * @param xmlString  XML plano generado por buildXml()
   * @param p12Buffer  Buffer con el archivo .p12 (PKCS#12)
   * @param p12Password Contraseña del .p12
   * @returns XML firmado en texto plano (el llamador hace el base64 final)
   */
  signXML(xmlString: string, p12Buffer: Buffer, p12Password: string): string {
    // 1. Parsear el .p12 y extraer clave privada + certificado X.509
    const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, p12Password);

    const keyBags = p12.getBags({
      bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
    })[forge.pki.oids.pkcs8ShroudedKeyBag];

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[
      forge.pki.oids.certBag
    ];

    if (!keyBags || keyBags.length === 0 || !keyBags[0].key) {
      throw new Error('No se encontró clave privada en el archivo .p12');
    }
    if (!certBags || certBags.length === 0 || !certBags[0].cert) {
      throw new Error('No se encontró certificado en el archivo .p12');
    }

    const privateKeyPem = forge.pki.privateKeyToPem(keyBags[0].key);
    const cert = certBags[0].cert;

    // DER del certificado en base64 (va dentro de <ds:X509Certificate>)
    const certDerBytes = forge.asn1
      .toDer(forge.pki.certificateToAsn1(cert))
      .getBytes();
    const certDerBase64 = forge.util.encode64(certDerBytes);

    // SHA-256 del DER del certificado (para xades:SigningCertificateV2)
    const certDigest = crypto
      .createHash('sha256')
      .update(Buffer.from(certDerBytes, 'binary'))
      .digest('base64');

    // 2. Construir el fragmento XAdES-BES QualifyingProperties e inyectarlo antes del cierre raíz
    const signingTime = this.formatCRDateTime(new Date());
    const xadesFragment = [
      `<ds:Object>`,
      `<xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#Signature">`,
      `<xades:SignedProperties Id="xades-signed-properties">`,
      `<xades:SignedSignatureProperties>`,
      `<xades:SigningTime>${signingTime}</xades:SigningTime>`,
      `<xades:SigningCertificateV2>`,
      `<xades:Cert>`,
      `<xades:CertDigest>`,
      `<ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>`,
      `<ds:DigestValue>${certDigest}</ds:DigestValue>`,
      `</xades:CertDigest>`,
      `</xades:Cert>`,
      `</xades:SigningCertificateV2>`,
      `</xades:SignedSignatureProperties>`,
      `<xades:SignedDataObjectProperties>`,
      `<xades:DataObjectFormat ObjectReference="#">`,
      `<xades:MimeType>text/xml</xades:MimeType>`,
      `</xades:DataObjectFormat>`,
      `</xades:SignedDataObjectProperties>`,
      `</xades:SignedProperties>`,
      `</xades:QualifyingProperties>`,
      `</ds:Object>`,
    ].join('');

    const closingTag = '</FacturaElectronica>';
    const xmlWithXades = xmlString.replace(
      closingTag,
      `${xadesFragment}${closingTag}`,
    );

    // Helper: BigInteger de node-forge → base64 sin byte de signo (prefijo 0x00)
    const biToB64 = (bi: any): string => {
      const bytes: number[] = bi.toByteArray();
      const start = bytes[0] === 0 ? 1 : 0;
      const bin = bytes
        .slice(start)
        .map((b: number) => String.fromCharCode(b & 0xff))
        .join('');
      return forge.util.encode64(bin);
    };

    const rsaKey = cert.publicKey as forge.pki.rsa.PublicKey;
    const modulusB64 = biToB64(rsaKey.n);
    const exponentB64 = biToB64(rsaKey.e);

    // 3. Firmar con xml-crypto (XMLDSig enveloped, RSA-SHA256)
    const sig = new SignedXml({
      privateKey: privateKeyPem,
      signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
      canonicalizationAlgorithm:
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
      getKeyInfoContent: ({ prefix } = {}) => {
        const p = prefix ?? 'ds';
        return (
          `<${p}:X509Data><${p}:X509Certificate>${certDerBase64}</${p}:X509Certificate></${p}:X509Data>` +
          `<${p}:KeyValue><${p}:RSAKeyValue>` +
          `<${p}:Modulus>${modulusB64}</${p}:Modulus>` +
          `<${p}:Exponent>${exponentB64}</${p}:Exponent>` +
          `</${p}:RSAKeyValue></${p}:KeyValue>`
        );
      },
    });

    // Reconocer el atributo 'Id' para resolver referencias URI por ID (necesario para XAdES)
    sig.idAttributes = ['Id', 'id', 'ID'];

    // Referencia 1: documento completo con transformación enveloped-signature
    sig.addReference({
      xpath: '/*',
      transforms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
      ],
      digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
      uri: '',
    });

    // Referencia 2: propiedades XAdES (xades:SignedProperties)
    sig.addReference({
      xpath: "//*[@Id='xades-signed-properties']",
      transforms: ['http://www.w3.org/TR/2001/REC-xml-c14n-20010315'],
      digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
      uri: '#xades-signed-properties',
    });

    sig.computeSignature(xmlWithXades, {
      location: { reference: '/*', action: 'append' },
      prefix: 'ds',
      attrs: { Id: 'Signature' },
    });

    return sig.getSignedXml();
  }

  /**
   * Formatea una fecha en hora de Costa Rica (UTC-6, sin horario de verano)
   * con el offset explícito requerido por Hacienda: "YYYY-MM-DDTHH:mm:ss-06:00"
   */
  private formatCRDateTime(date: Date): string {
    const offsetMs = -6 * 60 * 60 * 1000;
    const cr = new Date(date.getTime() + offsetMs);
    const yyyy = cr.getUTCFullYear();
    const MM = String(cr.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(cr.getUTCDate()).padStart(2, '0');
    const HH = String(cr.getUTCHours()).padStart(2, '0');
    const mm = String(cr.getUTCMinutes()).padStart(2, '0');
    const ss = String(cr.getUTCSeconds()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}-06:00`;
  }

  //Generador de NumeroConsecutivo(20 digitos)
  // 01 = "Factura Electronica", 04 = "Tiquet"
  generateConsecutive(
    docType: '01' | '04',
    terminal: number,
    pos: number,
    num: number,
  ): string {
    const pv = pos.toString().padStart(5, '0');
    const term = terminal.toString().padStart(3, '0');
    const n = num.toString().padStart(10, '0');

    return `${term}${pv}${docType}${n}`;
  }

  //Generador de Clave (50 digitos)
  generateClave(
    issuerId: string,
    consecutive: string,
    situation: '1' | '2' | '3' = '1',
  ) {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().substring(2);

    const id = issuerId.replace(/-/g, '').padStart(12, '0');
    // #10: crypto.randomInt es CSPRNG; Math.random() no lo es
    const randomSecure = crypto
      .randomInt(0, 100_000_000)
      .toString()
      .padStart(8, '0');

    const key = `506${day}${month}${year}${id}${consecutive}${situation}${randomSecure}`;

    if (key.length !== 50) {
      throw new Error(`Error generating key: wrong length (${key.length})`);
    }

    const qr = encodeQR(key, 'ascii');

    return { key, qr };
  }
  //Generador de QR para Hacienda

  /**
   * Mapea datos crudos de la BD al modelo EInvoice.
   * El engine conoce la estructura de EInvoice y se encarga de la transformación.
   */
  mapSaleToEInvoice(
    sale: any,
    items: any[],
    key: string,
    consecutive: string,
  ): EInvoice {
    return {
      clave: key,
      codigoActividad: sale.activity_code,
      numeroConsecutivo: consecutive,
      fechaEmision: this.formatCRDateTime(new Date()),
      emisor: {
        nombre: sale.issuer_name,
        identificacion: {
          tipo: sale.issuer_identification_type,
          numero: sale.issuer_identification,
        },
        ubicacion: {
          provincia: sale.provincia,
          canton: sale.canton,
          distrito: sale.distrito,
          otrasSenas: sale.otras_senas,
        },
        telefono: {
          codigoPais: sale.issuer_phone_code ?? '506',
          numero: sale.issuer_phone_number ?? '',
        },
        correoElectronico: sale.issuer_email,
      },
      receptor: sale.receiver_name
        ? {
            nombre: sale.receiver_name,
            identificacion: {
              tipo: sale.receiver_identification_type,
              numero: sale.receiver_identification,
            },
            correoElectronico: sale.receiver_email,
          }
        : undefined,
      condicionVenta: sale.sale_condition,
      medioPago: [sale.payment_method_code ?? '01'],
      detalle: items.map((item) => ({
        numeroLinea: item.line_number,
        codigo: item.cabys_code,
        cantidad: new Decimal(item.quantity),
        unidadMedida: item.unit_of_measure ?? 'Unid',
        detalle: item.description,
        precioUnitario: new Decimal(item.unit_price),
        montoTotal: new Decimal(item.total_amount),
        descuento:
          parseFloat(item.discount_amount) > 0
            ? {
                monto: new Decimal(item.discount_amount),
                naturaleza: 'Descuento comercial',
              }
            : undefined,
        subTotal: new Decimal(item.subtotal),
        impuestos: item.tax_code
          ? [
              {
                codigo: item.tax_code,
                codigoTarifa: item.tax_rate_code,
                tarifa: new Decimal(item.tax_rate),
                monto: new Decimal(item.tax_amount),
              },
            ]
          : [],
        montoTotalLinea: new Decimal(item.total_line_amount),
      })),
      resumenFactura: {
        codigoMoneda: sale.currency_code ?? 'CRC',
        tipoCambio: new Decimal(sale.exchange_rate ?? '1.00000'),
        totalServGravados: new Decimal(sale.total_serv_gravados ?? '0'),
        totalServExentos: new Decimal(sale.total_serv_exentos ?? '0'),
        totalServExonerados: new Decimal(sale.total_serv_exonerados ?? '0'),
        totalMercanciasGravadas: new Decimal(
          sale.total_mercancias_gravadas ?? '0',
        ),
        totalMercanciasExentas: new Decimal(
          sale.total_mercancias_exentas ?? '0',
        ),
        totalMercanciasExoneradas: new Decimal(
          sale.total_mercancias_exoneradas ?? '0',
        ),
        totalGravados: new Decimal(sale.subtotal_amount),
        totalExentos: new Decimal(0),
        totalExonerados: new Decimal(0),
        totalVenta: new Decimal(sale.subtotal_amount),
        totalDescuentos: new Decimal(0),
        totalVentaNeta: new Decimal(sale.subtotal_amount),
        totalImpuestos: new Decimal(sale.tax_amount),
        totalComprobante: new Decimal(sale.total_amount),
      },
    };
  }
}
