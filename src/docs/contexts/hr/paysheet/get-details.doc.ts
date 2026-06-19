// src/docs/contexts/hr/paysheet/get-details.doc.ts
export const getPaysheetDetailsDoc = {
  operation: {
    summary: 'Get paysheet details',
    description:
      'Returns the per-employee detail lines for a given paysheet, including their calculated net pay.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Paysheet details retrieved.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            employee_id: { type: 'string', example: 'uuid' },
            gross_pay: { type: 'number', example: 800000 },
            net_pay: { type: 'number', example: 650000 },
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
    404: {
      status: 404,
      description: 'Paysheet not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Not Found' },
        },
      },
    },
  },
};
