// src/docs/contexts/general/customer_payment/delete-payment.doc.ts
export const deleteCustomerPaymentDoc = {
  operation: {
    summary: 'Delete a customer payment',
    description: 'Permanently deletes a customer payment record.',
  },
  responses: {
    200: {
      status: 200,
      description: 'Payment deleted.',
      schema: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Payment deleted' } },
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
    404: {
      status: 404,
      description: 'Payment not found.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Payment not found' } },
      },
    },
  },
};
