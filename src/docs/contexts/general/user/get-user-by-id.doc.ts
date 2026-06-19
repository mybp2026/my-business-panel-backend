export const getUserByIdDoc = {
  operation: {
    summary: 'Get user by ID',
    description: 'Retrieves a user record by their unique identifier.',
  },

  responses: {
    200: {
      status: 200,
      description: 'User found.',
      schema: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: { type: 'string', example: 'juan.perez@empresa.com' },
          role_id: { type: 'number', example: 2 },
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
      description: 'User not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'User not found' },
        },
      },
    },
  },
};
