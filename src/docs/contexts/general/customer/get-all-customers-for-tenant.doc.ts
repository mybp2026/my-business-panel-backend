// src/docs/contexts/general/customer/get-all-customers-for-tenant.doc.ts
export const getAllCustomersForTenantDoc = {
  operation: {
    summary: 'Get all customers for a tenant',
    description: 'Returns all customers associated with a specific tenant.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Customers retrieved successfully.',
      schema: {
        type: 'array',
        items: {
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
            document_type_id: { type: 'number', example: 1 },
            document_number: { type: 'string', example: '1-1234-5678' },
            email: { type: 'string', example: 'maria.lopez@example.com' },
            phone: { type: 'string', example: '+50688889999' },
            address: { type: 'string', example: 'San José, Costa Rica' },
          },
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
  },
};
