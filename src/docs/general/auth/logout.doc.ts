export const logoutDoc = {
  operation: {
    summary: 'Logout a user',
    description:
      'This endpoint allows users to logout and invalidate their authentication token.',
  },
  responses: {
    200: {
      status: 200,
      description: 'Logout successful',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Logout successful' },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized - Invalid or missing authentication token',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
