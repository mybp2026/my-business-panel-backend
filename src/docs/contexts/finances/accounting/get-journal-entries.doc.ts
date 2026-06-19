// src/docs/contexts/finances/accounting/get-journal-entries.doc.ts
export const getJournalEntriesDoc = {
  operation: {
    summary: 'Obtener asientos contables del tenant',
  },

  responses: {
    200: {
      status: 200,
      description: 'Lista de asientos contables.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            entry_id: {
              type: 'string',
              example: '3b8f2c91-e4a7-4d5b-a0c6-7d1e9f3b2a85',
            },
            description: { type: 'string', example: 'Venta de contado' },
          },
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
  },
};
