// src/docs/contexts/general/customer_payment/get-all-payments.doc.ts
export const getAllPaymentsDoc = {
  operation: {
    summary: 'Get all customer payments',
    description: 'Returns all customer payment records in the system.',
  },
  responses: {
    200: {
      status: 200,
      description: 'List of payments.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            payment_id: { type: 'string', example: 'uuid' },
            payment_amount: { type: 'number', example: 5000 },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Unauthorized' } },
      },
    },
  },
};
