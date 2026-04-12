// src/docs/contexts/finances/accounting/get-journal-entry-statuses.doc.ts
export const getJournalEntryStatusesDoc = {
  operation: {
    summary: 'Obtener estados de asiento contable',
  },

  responses: {
    200: {
      status: 200,
      description: 'Lista de estados de asiento.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            status_id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Activo' },
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
