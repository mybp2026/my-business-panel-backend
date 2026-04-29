// src/docs/contexts/finances/expense/get-fiscal-periods.doc.ts
export const getFiscalPeriodsDoc = {
  operation: {
    summary: 'Períodos fiscales del tenant',
  },

  responses: {
    200: {
      status: 200,
      description: 'Períodos fiscales registrados.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            period_id: { type: 'string', example: '2a6d4f91-c3b8-4e5a-d0e7-1f9b3c8a2d74' },
            name: { type: 'string', example: 'Q1 2024' },
            start_date: { type: 'string', example: '2024-01-01' },
            end_date: { type: 'string', example: '2024-03-31' },
            is_closed: { type: 'boolean', example: true },
          },
        },
      },
    },
  },
};
