// src/docs/contexts/general/user/assign-role.doc.ts
export const assignRoleDoc = {
  dto: {
    user_id: {
      description: 'UUID of the user to whom the role will be assigned.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    role_id: {
      description: 'Numeric ID of the role to assign (1=Admin, 2=User, 3=Viewer).',
      example: 2,
    },
  },

  operation: {
    summary: 'Assign a role to a user',
    description: 'Updates the role of an existing user within the system.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Role assigned successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'role assigned successfully!' },
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
