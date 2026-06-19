// src/docs/contexts/hr/tardiness/get_tardiness_by_branch.doc.ts
export const getTardinessByBranchDoc = {
  operation: {
    summary: 'Tardanzas por sucursal',
  },

  responses: {
    200: {
      status: 200,
      description: 'Tardanzas y conteo total.',
      schema: {
        type: 'object',
        properties: {
          tardiness: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tardiness_id: {
                  type: 'string',
                  example: 'f1a2b3c4-d5e6-7890-fabc-789012345678',
                },
                employee_id: {
                  type: 'string',
                  example: '1a2b3c4d-5e6f-7890-abcd-ef1234567890',
                },
                type: { type: 'string', example: 'LATE_ENTRY' },
                log: { type: 'string', example: '08:17' },
                registered_at: {
                  type: 'string',
                  example: '2024-03-14T08:17:00.000Z',
                },
              },
            },
          },
          totalCount: { type: 'number', example: 12 },
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
