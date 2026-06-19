// src/docs/contexts/general/customer_segment_margin/get-margins-by-tenant.doc.ts
export const getMarginsByTenantDoc = {
  operation: {
    summary: 'Get segment margins by tenant',
    description: 'Returns all margin configurations for a specific tenant.',
  },
  responses: {
    200: {
      status: 200,
      description: 'List of margins for the tenant.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: { margin_id: { type: 'string', example: 'uuid' } },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Unauthorized' } },
      },
    },
  },
};
