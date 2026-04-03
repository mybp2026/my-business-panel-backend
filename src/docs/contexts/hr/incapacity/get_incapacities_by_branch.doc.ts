// src/docs/contexts/hr/incapacity/get_incapacities_by_branch.doc.ts
export const getIncapacitiesByBranchDoc = {
  operation: {
    summary: 'Incapacidades por sucursal',
  },

  responses: {
    200: {
      status: 200,
      description: 'Incapacidades de la sucursal.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            incapacity_id: { type: 'string', example: 'b2c3d4e5-f6a7-8901-bcde-234567890123' },
            employee_id: { type: 'string', example: '2b3c4d5e-6f7a-8901-bcde-f12345678901' },
            type: { type: 'string', example: 'CCSS' },
            period_start: { type: 'string', example: '2024-02-05' },
            period_end: { type: 'string', example: '2024-02-12' },
            days_paying: { type: 'number', example: 7 },
            percentage_to_pay: { type: 'number', example: 60 },
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
