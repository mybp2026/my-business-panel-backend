// src/docs/contexts/hr/foul/get_fouls_by_branch.doc.ts
export const getFoulsByBranchDoc = {
  operation: {
    summary: 'Faltas por sucursal',
  },

  responses: {
    200: {
      status: 200,
      description: 'Faltas registradas en la sucursal.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            employee_id: {
              type: 'string',
              example: '2b3c4d5e-6f7a-8901-bcde-f12345678901',
            },
            identificator: { type: 'string', example: '3-0456-0891' },
            foul_date: { type: 'string', example: '2024-03-18' },
            foul_hour: { type: 'string', example: '08:45' },
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
