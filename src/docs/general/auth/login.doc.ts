export const loginDoc = {
  dto: {
    email: {
      description: 'The email address of the user.',
      example: 'johndoe@mybp.com',
    },
    password: {
      description: 'The password of the user.',
      example: 'SecurePassword123!',
    },
  },

  operation: {
    summary: 'User login',
    description:
      'This endpoint allows users to log in by providing their email and password. On successful login, an authentication token is set in an HTTP-only cookie.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Login successful',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Login successful' },
          user: {
            type: 'object',
            properties: {
              user_id: {
                type: 'string',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              email: { type: 'string', example: 'johndoe@mybp.com' },
              tenant_id: {
                type: 'string',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              role_id: {
                type: 'string',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
            },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized - Invalid credentials',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Provided credentials are invalid',
          },
        },
      },
    },
  },
};
