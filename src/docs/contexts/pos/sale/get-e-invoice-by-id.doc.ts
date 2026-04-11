// src/docs/contexts/pos/sale/get-e-invoice-by-id.doc.ts
export const getEInvoiceByIdDoc = {
  operation: {
    summary: 'Obtener factura electrónica por ID',
  },

  responses: {
    200: {
      status: 200,
      description: 'Datos de la factura electrónica.',
      schema: {
        type: 'object',
        properties: {
          invoice_id: { type: 'string', example: 'a2b3c4d5-e6f7-8901-abcd-ef1234567890' },
          sale_id: { type: 'string', example: 'f6a1b2c3-d4e5-6789-fabc-345678901234' },
          issued_at: { type: 'string', example: '2024-04-01T10:31:00.000Z' },
          total_amount: { type: 'number', example: 95779 },
        },
      },
    },
  },
};
