// src/docs/contexts/hr/paysheet/get-by-id.doc.ts
export const getPaysheetByIdDoc = {
  operation: {
    summary: 'Get paysheet by ID',
    description: 'Returns the full details of a paysheet by its UUID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Paysheet found.',
      schema: {
        type: 'object',
        properties: {
          paysheet_id: { type: 'string', example: 'uuid' },
          period_start: { type: 'string', example: '2024-04-01' },
          period_end: { type: 'string', example: '2024-04-30' },
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
      description: 'Paysheet not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Paysheet not found' },
        },
      },
    },
  },
};
