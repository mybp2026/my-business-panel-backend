// src/docs/contexts/hr/clocking/clock-out.doc.ts
export const clockOutDoc = {
  operation: {
    summary: 'Register clock-out',
    description:
      'Records the exit time for an employee, closing the active clock-in session.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Clock-out registered successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Clock-out registered' },
        },
      },
    },
    400: {
      status: 400,
      description: 'The employee has no active clock-in session.',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'No active clock-in session found',
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
