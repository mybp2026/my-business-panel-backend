// src/docs/contexts/general/tenant/get-single-tenant.doc.ts
export const getSingleTenantDoc = {
  operation: {
    summary: 'Get tenant by ID',
    description: 'Retrieves a single tenant by its UUID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Tenant found.',
      schema: {
        type: 'object',
        properties: {
          tenant_id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          tenant_name: { type: 'string', example: 'Acme Corp' },
          contact_email: { type: 'string', example: 'admin@acme.com' },
          is_subscribed: { type: 'boolean', example: true },
          region_id: { type: 'number', example: 1 },
          identification: { type: 'string', example: '3-101-123456' },
          economic_activity: {
            type: 'string',
            example: 'Software Development',
          },
          sign: { type: 'string', example: 'ACME' },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized — Missing or invalid authentication token.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
