// src/docs/contexts/general/auth/logout.doc.ts
export const logoutDoc = {
  operation: {
    summary: 'Logout',
    description:
      'Clears the auth_token cookie, ending the user session. Requires a valid authentication token.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Logout successful. Auth cookie is cleared.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Logout successful' },
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
