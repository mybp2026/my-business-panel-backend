// src/docs/contexts/general/customer_payment/new-payment.doc.ts
export const newPaymentDoc = {
  dto: {
    tenant_customer_id: { description: 'UUID of the customer making the payment.', example: '123e4567-e89b-12d3-a456-426614174000' },
    sale_id: { description: 'UUID of the associated sale. Optional.', example: 'abc12345-e89b-12d3-a456-426614174000' },
    payment_method_id: { description: 'ID of the payment method used.', example: 1 },
    payment_amount: { description: 'Amount paid.', example: 5000 },
    payment_date: { description: 'Date and time the payment was made.', example: '2024-04-01T10:00:00.000Z' },
    currency_id: { description: 'ID of the currency used.', example: 1 },
    verified: { description: 'Whether the payment has been verified.', example: true },
  },
  operation: { summary: 'Register a new customer payment', description: 'Creates a new customer payment record.' },
  responses: {
    201: { status: 201, description: 'Payment registered.', schema: { type: 'object', properties: { payment_id: { type: 'string', example: 'uuid' } } } },
    400: { status: 400, description: 'Invalid data.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Bad Request' } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
  },
};
