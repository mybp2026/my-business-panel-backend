// src/docs/contexts/hr/foul/get_fouls_by_period.doc.ts
export const getFoulsByPeriodDoc = {
  operation: {
    summary: 'Faltas por período',
  },

  responses: {
    200: {
      status: 200,
      description: 'Faltas del período.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            foul_id: {
              type: 'string',
              example: 'a0b1c2d3-e4f5-6789-abcd-012345678901',
            },
            employee_id: {
              type: 'string',
              example: '2b3c4d5e-6f7a-8901-bcde-f12345678901',
            },
            foul_date: { type: 'string', example: '2024-03-18' },
            description: { type: 'string', example: 'Ausencia injustificada' },
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
