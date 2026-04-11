// src/docs/contexts/pos/sale/create-e-invoice-for-sale.doc.ts
export const createEInvoiceForSaleDoc = {
  operation: {
    summary: 'Generar factura electrónica para una venta',
  },

  responses: {
    201: {
      status: 201,
      description: 'Factura electrónica generada para la venta indicada.',
      schema: {
        type: 'object',
        properties: {
          invoice_id: { type: 'string', example: 'a2b3c4d5-e6f7-8901-abcd-ef1234567890' },
          sale_id: { type: 'string', example: 'f6a1b2c3-d4e5-6789-fabc-345678901234' },
          issued_at: { type: 'string', example: '2024-04-01T10:31:00.000Z' },
        },
      },
    },
    500: {
      status: 500,
      description: 'Error al generar la factura electrónica.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Error generating e-invoice' },
        },
      },
    },
  },
};
