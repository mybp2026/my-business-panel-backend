// src/docs/contexts/general/tenant/get-users-by-tenant.doc.ts
export const getUsersByTenantDoc = {
  operation: {
    summary: 'Get users by tenant',
    description:
      'Returns all users belonging to a specific tenant, identified by its UUID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Users retrieved successfully.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            user_id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: { type: 'string', example: 'juan.perez@empresa.com' },
            tenant_id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            role_id: { type: 'number', example: 2 },
          },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid tenant ID format — must be a valid UUID.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Invalid tenant' },
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
