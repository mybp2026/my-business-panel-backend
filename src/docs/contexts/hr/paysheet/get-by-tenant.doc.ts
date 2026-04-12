// src/docs/contexts/hr/paysheet/get-by-tenant.doc.ts
export const getPaysheetsByTenantDoc = {
  operation: {
    summary: 'Get paysheets by tenant',
    description: 'Returns all paysheets generated for a specific tenant.',
  },

  responses: {
    200: {
      status: 200,
      description: 'List of paysheets.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            paysheet_id: { type: 'string', example: 'uuid' },
            period_start: { type: 'string', example: '2024-04-01' },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
