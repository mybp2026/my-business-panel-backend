// src/docs/contexts/pos/loyal-program/delete-loyal-program.doc.ts
export const deleteLoyalProgramDoc = {
  operation: {
    summary: 'Delete loyalty program',
    description: 'Removes a loyalty program by its ID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Loyalty program deleted.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Loyal program deleted successfully' },
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
