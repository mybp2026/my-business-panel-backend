// src/docs/contexts/pos/loyal-program/update-loyal-program.doc.ts
export const updateLoyalProgramDoc = {
  operation: {
    summary: 'Update loyalty program',
    description: 'Updates the configuration of an existing loyalty program.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Loyalty program updated.',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Loyal program updated successfully',
          },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid data.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
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
    404: {
      status: 404,
      description: 'Loyalty program not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Loyal program not found' },
        },
      },
    },
  },
};
