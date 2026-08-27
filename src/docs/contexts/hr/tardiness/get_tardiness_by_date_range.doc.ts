// src/docs/contexts/hr/tardiness/get_tardiness_by_date_range.doc.ts
export const getTardinessByDateRangeDoc = {
  operation: {
    summary: 'Tardanzas por rango de fechas',
  },

  responses: {
    200: {
      status: 200,
      description: 'Tardanzas del rango.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            employee_id: {
              type: 'string',
              example: '1a2b3c4d-5e6f-7890-abcd-ef1234567890',
            },
            type: { type: 'string', example: 'LATE_ENTRY' },
            log: { type: 'string', example: '08:31' },
            registered_at: {
              type: 'string',
              example: '2024-03-10T08:31:00.000Z',
            },
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
