// src/docs/contexts/general/customer/create-customer.doc.ts
export const createCustomerDoc = {
  dto: {
    tenant_id: {
      description: 'UUID of the tenant this customer belongs to.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    first_name: {
      description: 'First name of the customer.',
      example: 'María',
    },
    last_name: {
      description: 'Last name of the customer.',
      example: 'López',
    },
    document_type_id: {
      description: 'ID of the document type (e.g. 1=Cédula, 2=Passport).',
      example: 1,
    },
    document_number: {
      description: 'Identification document number.',
      example: '1-1234-5678',
    },
    economic_activity: {
      description: 'Economic activity or profession of the customer.',
      example: 'Teacher',
    },
    email: {
      description: 'Email address of the customer.',
      example: 'maria.lopez@example.com',
    },
    phone: {
      description: 'Phone number of the customer.',
      example: '+50688889999',
    },
    birthdate: {
      description: 'Date of birth of the customer. Optional.',
      example: '1990-05-15',
    },
    address: {
      description: 'Physical address of the customer.',
      example: 'San José, Costa Rica',
    },
    is_tenant: {
      description: 'Whether this customer is also a tenant. Optional, defaults to false.',
      example: false,
    },
  },

  operation: {
    summary: 'Create a new customer',
    description: 'Registers a new customer associated with a tenant.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Customer created successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Customer created' },
          customer: {
            type: 'object',
            properties: {
              tenant_customer_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
              email: { type: 'string', example: 'maria.lopez@example.com' },
            },
          },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid or missing required fields.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
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
