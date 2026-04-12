// src/docs/contexts/general/customer_payment/get-customer-payments.doc.ts
export const getCustomerPaymentsDoc = {
  operation: { summary: 'Get payments for a customer', description: 'Returns all payments made by a specific customer.' },
  responses: {
    200: { status: 200, description: 'List of customer payments.', schema: { type: 'array', items: { type: 'object', properties: { payment_id: { type: 'string', example: 'uuid' }, payment_amount: { type: 'number', example: 5000 } } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
    404: { status: 404, description: 'Customer not found.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Customer not found' } } } },
  },
};
