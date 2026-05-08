// src/docs/contexts/general/user/get-self-info.doc.ts
export const getSelfInfoDoc = {
  operation: {
    summary: 'Get current user info',
    description:
      'Returns the profile information of the currently authenticated user, including their role and tenant.',
  },

  responses: {
    200: {
      status: 200,
      description: 'User info retrieved successfully.',
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'juan.perez@empresa.com' },
          role: {
            type: 'object',
            properties: {
              role_id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Admin' },
            },
          },
          tenant: {
            type: 'object',
            properties: {
              tenant_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
              name: { type: 'string', example: 'Acme Corp' },
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
  },
};
