// src/docs/contexts/general/auth/login.doc.ts
export const loginDoc = {
  dto: {
    email: {
      description: 'Email address of the user.',
      example: 'juan.perez@empresa.com',
    },
    password: {
      description:
        'Password in plain text. Will be compared against the stored hash.',
      example: 'MyPassword123!',
    },
  },

  operation: {
    summary: 'Login',
    description:
      'Authenticates a user with email and password. On success, sets an httpOnly cookie (auth_token) valid for 24 hours and returns the user session data.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Login successful. Auth cookie is set.',
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
    },
    401: {
      status: 401,
      description: 'Invalid credentials — user not found or wrong password.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Invalid credentials' },
        },
      },
    },
  },
};
