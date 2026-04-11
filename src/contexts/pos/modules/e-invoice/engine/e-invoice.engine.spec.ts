import Decimal from 'decimal.js';
import { XmlGeneratorEngine } from './xml_generator.engine';
import { EInvoice } from '../interface/e-invoice.interface';
// import * as path from 'path';
// import * as fs from 'fs';
import * as forge from 'node-forge';

describe('EInvoiceEngine - Generation test', () => {
  let engine: XmlGeneratorEngine;

  beforeEach(() => {
    engine = new XmlGeneratorEngine();
  });

  it('should generate a valid XML', async () => {
    const start = performance.now();
    const docType = '01';
    const pos = 1;
    const terminal = 1;
    const invoiceNumber = 1;

    const consecutive = engine.generateConsecutive(
      docType,
      terminal,
      pos,
      invoiceNumber,
    );

    expect(consecutive).toHaveLength(20);

    const issuerId = '3101234567';
    const { key, qr } = engine.generateClave(issuerId, consecutive, '1');
    console.log('NumeroConsecutivo, ', consecutive);
    console.log('Clave, ', key);
    console.log(qr);

    expect(key).toHaveLength(50);
    expect(key.includes(consecutive)).toBeTruthy();
    const mock: EInvoice = {
      clave: key,
      codigoActividad: '722001',
      numeroConsecutivo: consecutive,
      fechaEmision: '2021-01-01T12:00:00-06:00',
      emisor: {
        nombre: 'Empresa de Prueba S.A.',
        identificacion: {
          tipo: '02',
          numero: '3101234567',
        },
        ubicacion: {
          provincia: '1',
          canton: '01',
          distrito: '01',
          otrasSenas: 'San José, Calle 1, Casa 1',
        },
        correoElectronico: 'info@empresa.com',
        telefono: {
          codigoPais: '506',
          numero: '12345678',
        },
      },
      receptor: {
        nombre: 'Cliente de Prueba S.A.',
        identificacion: {
          tipo: '02',
          numero: '3101234567',
        },
        correoElectronico: 'cliente@empresa.com',
      },
      condicionVenta: '01',
      medioPago: ['01', '03'],
      detalle: [
        {
          numeroLinea: 1,
          codigo: '2399900009900',
          cantidad: new Decimal(2),
          unidadMedida: 'Unid',
          detalle: 'Producto de prueba',
          precioUnitario: new Decimal(10.0),
          montoTotal: new Decimal(20.0),
          subTotal: new Decimal(20.0),
          montoTotalLinea: new Decimal(20.0),
        },
        {
          numeroLinea: 2,
          codigo: '8314400000100',
          cantidad: new Decimal(1),
          unidadMedida: 'Unid',
          detalle: 'Servicio de prueba',
          precioUnitario: new Decimal(50.0),
          montoTotal: new Decimal(50.0),
          subTotal: new Decimal(50.0),
          montoTotalLinea: new Decimal(50.0),
        },
      ],
      resumenFactura: {
        codigoMoneda: 'CRC',
        tipoCambio: new Decimal(1),
        totalServGravados: new Decimal(70.0),
        totalServExentos: new Decimal(0),
        totalServExonerados: new Decimal(0),
        totalMercanciasGravadas: new Decimal(0),
        totalMercanciasExentas: new Decimal(0),
        totalMercanciasExoneradas: new Decimal(0),
        totalGravados: new Decimal(70.0),
        totalExentos: new Decimal(0),
        totalExonerados: new Decimal(0),
        totalVenta: new Decimal(70.0),
        totalDescuentos: new Decimal(0),
        totalVentaNeta: new Decimal(70.0),
        totalImpuestos: new Decimal(12.6),
        totalComprobante: new Decimal(82.6),
      },
    };

    const xmlString = await engine.buildXml(mock);
    expect(xmlString).toBeDefined();
    expect(typeof xmlString).toBe('string');
    // buildXml now returns plain XML, not base64
    expect(xmlString.startsWith('<?xml')).toBeTruthy();

    const end = performance.now();
    console.log(`XML generation took ${(end - start).toFixed(2)} ms`);

    // const filePath = path.join(
    //   process.cwd(),
    //   'src',
    //   'modules',
    //   'e-invoice',
    //   'templates',
    //   `invoice_${mock.numeroConsecutivo}.xml`,
    // );

    // expect(fs.existsSync(filePath)).toBeTruthy();

    expect(xmlString).toContain(`<Clave>${key}</Clave>`);
    expect(xmlString).toContain('<CodigoCABYS>2399900009900</CodigoCABYS>');

    // console.log('XML generated successfully at:', filePath);
  });
});

describe('signXML - XAdES-BES signature test', () => {
  let engine: XmlGeneratorEngine;
  let p12Buffer: Buffer;
  const p12Password = 'test-password';

  beforeEach(() => {
    engine = new XmlGeneratorEngine();
  });

  // Generate a self-signed certificate programmatically — no external .p12 file needed
  beforeAll(() => {
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(
      cert.validity.notBefore.getFullYear() + 1,
    );
    cert.setSubject([{ name: 'commonName', value: 'Test Emisor CR' }]);
    cert.setIssuer([{ name: 'commonName', value: 'Test Emisor CR' }]);
    cert.sign(keys.privateKey, forge.md.sha256.create());

    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
      keys.privateKey,
      [cert],
      p12Password,
      { algorithm: '3des' },
    );
    p12Buffer = Buffer.from(forge.asn1.toDer(p12Asn1).getBytes(), 'binary');
  });

  it('should return a signed XML containing <ds:Signature>', () => {
    const sampleXml = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<FacturaElectronica xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica"',
      '  xmlns:ds="http://www.w3.org/2000/09/xmldsig#" version="4.4">',
      '  <Clave>50601012500310123456700100100010000000011999999</Clave>',
      '  <NumeroConsecutivo>00100100010000000011</NumeroConsecutivo>',
      '</FacturaElectronica>',
    ].join('\n');

    const signed = engine.signXML(sampleXml, p12Buffer, p12Password);

    expect(signed).toBeDefined();
    expect(typeof signed).toBe('string');
    // Debe contener el nodo de firma XMLDSig
    expect(signed).toContain('<ds:Signature');
    // Debe contener las propiedades XAdES-BES
    expect(signed).toContain('<xades:QualifyingProperties');
    expect(signed).toContain('<xades:SigningTime>');
    expect(signed).toContain('<xades:SigningCertificateV2>');
    // El contenido original del XML debe preservarse (integridad)
    expect(signed).toContain(
      '<Clave>50601012500310123456700100100010000000011999999</Clave>',
    );
    // El resultado es XML plano, no base64
    expect(signed.startsWith('<?xml')).toBeTruthy();

    console.log('Signed XML (first 500 chars):', signed.substring(0, 500));
  });

  it('should throw when the .p12 password is wrong', () => {
    const sampleXml =
      '<?xml version="1.0"?><FacturaElectronica xmlns:ds="http://www.w3.org/2000/09/xmldsig#"></FacturaElectronica>';

    expect(() => engine.signXML(sampleXml, p12Buffer, 'wrong-password')).toThrow();
  });
});
