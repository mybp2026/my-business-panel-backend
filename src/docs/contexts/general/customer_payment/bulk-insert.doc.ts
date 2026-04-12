// src/docs/contexts/general/customer_payment/bulk-insert.doc.ts
export const bulkInsertPaymentsDoc = {
  operation: { summary: 'Bulk insert payments for a sale', description: 'Registers multiple payment records linked to a single sale.' },
  responses: {
    201: { status: 201, description: 'Payments inserted.', schema: { type: 'object', properties: { message: { type: 'string', example: 'Payments inserted successfully' } } } },
    400: { status: 400, description: 'Invalid data.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Bad Request' } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
  },
};
