export const deleteUserDoc = {
  operation: {
    summary: 'Delete a user',
    description: 'Permanently deletes a user by their UUID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'User deleted successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'user deleted successfully' },
          user_id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized — Missing or invalid authentication token.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Unauthorized' } },
      },
    },
    404: {
      status: 404,
      description: 'User not found.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'User not found' } },
      },
    },
  },
};
