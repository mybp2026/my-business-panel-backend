// src/docs/contexts/general/customer/get-one-customer-by-id.doc.ts
export const getOneCustomerByIdDoc = {
  operation: {
    summary: 'Get customer by ID',
    description: 'Retrieves a single customer by their UUID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Customer found.',
      schema: {
        type: 'object',
        properties: {
          tenant_customer_id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          tenant_id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          first_name: { type: 'string', example: 'María' },
          last_name: { type: 'string', example: 'López' },
          document_number: { type: 'string', example: '1-1234-5678' },
          email: { type: 'string', example: 'maria.lopez@example.com' },
          phone: { type: 'string', example: '+50688889999' },
          address: { type: 'string', example: 'San José, Costa Rica' },
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
