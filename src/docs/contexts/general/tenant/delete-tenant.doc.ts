// src/docs/contexts/general/tenant/delete-tenant.doc.ts
export const deleteTenantDoc = {
  operation: {
    summary: 'Delete a tenant',
    description:
      'Deletes a tenant by its UUID. Returns an error if the tenant does not exist.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Tenant deleted successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Tenant deleted successfully' },
          tenant: {
            type: 'object',
            properties: {
              tenant_id: {
                type: 'string',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              tenant_name: { type: 'string', example: 'Acme Corp' },
            },
          },
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
    404: {
      status: 404,
      description: 'Tenant not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Tenant not found' },
        },
      },
    },
  },
};
