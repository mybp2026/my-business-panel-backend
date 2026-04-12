// src/docs/contexts/finances/accounting/void-journal-entry.doc.ts
export const voidJournalEntryDoc = {
  operation: {
    summary: 'Anular asiento contable',
  },

  responses: {
    201: {
      status: 201,
      description: 'Asiento anulado. Se genera un asiento de reversión automáticamente.',
      schema: {
        type: 'object',
        properties: {
          reversal_entry_id: { type: 'string', example: '3b8f2c91-e4a7-4d5b-a0c6-7d1e9f3b2a85' },
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
      description: 'El asiento contable no existe para este tenant.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Asiento contable no encontrado' },
        },
      },
    },
  },
};
