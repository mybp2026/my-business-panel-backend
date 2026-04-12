// src/docs/contexts/hr/paysheet/get-by-period.doc.ts
export const getPaysheetByPeriodDoc = {
  operation: {
    summary: 'Get paysheet by period',
    description: 'Returns the paysheet for a branch within a specific date range.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Paysheet found for the given period.',
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
  },
};
