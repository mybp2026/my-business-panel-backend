// src/docs/contexts/hr/contract/update-contract.doc.ts
export const updateContractDoc = {
  operation: {
    summary: 'Update contract terms',
    description: 'Updates the terms of an existing employee contract, such as salary, dates, or turn.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Contract updated successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Contract updated successfully' },
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
      description: 'Contract not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Contract not found' },
        },
      },
    },
  },
};
