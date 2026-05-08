// src/docs/contexts/general/user/get-user-roles.doc.ts
export const getUserRolesDoc = {
  operation: {
    summary: 'Get all available roles',
    description: 'Returns the list of all roles available in the system.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Roles retrieved successfully.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            role_id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Admin' },
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
