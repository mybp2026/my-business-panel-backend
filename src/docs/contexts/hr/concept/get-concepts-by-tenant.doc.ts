// src/docs/contexts/hr/concept/get-concepts-by-tenant.doc.ts
export const getConceptsByTenantDoc = {
  operation: {
    summary: 'Get concepts by tenant',
    description: 'Returns all payroll concepts (earnings and deductions) configured for a specific tenant.',
  },

  responses: {
    200: {
      status: 200,
      description: 'List of payroll concepts for the tenant.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            concept_id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Salario Base' },
            type: { type: 'string', example: 'earning' },
            calcMethod: { type: 'string', example: 'fixed' },
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
