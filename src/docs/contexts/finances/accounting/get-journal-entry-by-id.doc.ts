// src/docs/contexts/finances/accounting/get-journal-entry-by-id.doc.ts
export const getJournalEntryByIdDoc = {
  operation: {
    summary: 'Obtener asiento contable por ID',
  },

  responses: {
    200: {
      status: 200,
      description: 'Detalle del asiento contable.',
      schema: {
        type: 'object',
        properties: {
          entry_id: { type: 'string', example: '3b8f2c91-e4a7-4d5b-a0c6-7d1e9f3b2a85' },
          description: { type: 'string', example: 'Venta de contado' },
        },
      },
    },
    401: {
      status: 401,
      description: 'No autorizado.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
    404: {
      status: 404,
      description: 'Asiento contable no encontrado.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Journal entry not found' },
        },
      },
    },
  },
};
