// src/docs/contexts/finances/accounting/create-journal-entry.doc.ts
export const createJournalEntryDoc = {
  operation: {
    summary: 'Crear asiento contable',
  },

  responses: {
    201: {
      status: 201,
      description: 'Asiento contable creado.',
      schema: {
        type: 'object',
        properties: {
          entry_id: {
            type: 'string',
            example: '3b8f2c91-e4a7-4d5b-a0c6-7d1e9f3b2a85',
          },
        },
      },
    },
    400: {
      status: 400,
      description: 'Datos inválidos o asiento no balanceado.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Journal entry is not balanced' },
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
