// src/docs/contexts/general/customer/update-customer.doc.ts
export const updateCustomerDoc = {
  dto: {
    first_name: { description: 'New first name. Optional.', example: 'María' },
    last_name: { description: 'New last name. Optional.', example: 'López Gómez' },
    document_type_id: { description: 'New document type ID. Optional.', example: 2 },
    document_number: { description: 'New document number. Optional.', example: '2-9876-5432' },
    economic_activity: { description: 'New economic activity. Optional.', example: 'Engineer' },
    email: { description: 'New email address. Optional.', example: 'new.email@example.com' },
    phone: { description: 'New phone number. Optional.', example: '+50688880000' },
    birthdate: { description: 'New date of birth. Optional.', example: '1992-08-20' },
    address: { description: 'New physical address. Optional.', example: 'Heredia, Costa Rica' },
    is_tenant: { description: 'Update tenant flag. Optional.', example: true },
  },

  operation: {
    summary: 'Update a customer',
    description:
      'Partially updates the fields of a customer. At least one field must be provided.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Customer updated successfully.',
      schema: {
        type: 'object',
        properties: {
          tenant_customer_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          email: { type: 'string', example: 'new.email@example.com' },
        },
      },
    },
    400: {
      status: 400,
      description: 'No valid fields provided to update.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'No valid fields to update' },
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
