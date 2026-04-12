// src/docs/contexts/hr/paysheet/get-by-branch.doc.ts
export const getPaysheetByBranchDoc = {
  operation: {
    summary: 'Get paysheets by branch',
    description: 'Returns all paysheets associated with a specific branch.',
  },

  responses: {
    200: {
      status: 200,
      description: 'List of paysheets for the branch.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            paysheet_id: { type: 'string', example: 'uuid' },
            period_start: { type: 'string', example: '2024-04-01' },
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
