// src/docs/contexts/pos/sale/get-e-invoices-by-branch.doc.ts
export const getEInvoicesByBranchDoc = {
  operation: {
    summary: 'Facturas electrónicas por sucursal',
  },

  responses: {
    200: {
      status: 200,
      description: 'Facturas electrónicas emitidas en la sucursal.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            invoice_id: { type: 'string', example: 'a2b3c4d5-e6f7-8901-abcd-ef1234567890' },
            sale_id: { type: 'string', example: 'f6a1b2c3-d4e5-6789-fabc-345678901234' },
            branch_id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            issued_at: { type: 'string', example: '2024-04-01T10:31:00.000Z' },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
