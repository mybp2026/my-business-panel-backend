// src/docs/contexts/general/customer/delete-customer.doc.ts
export const deleteCustomerDoc = {
  operation: {
    summary: 'Delete a customer',
    description: 'Deletes a customer by their UUID. Returns an error if the customer does not exist.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Customer deleted successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Customer deleted' },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized — Missing or invalid authentication token.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
    404: {
      status: 404,
      description: 'Customer not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Customer not found' },
        },
      },
    },
  },
};
