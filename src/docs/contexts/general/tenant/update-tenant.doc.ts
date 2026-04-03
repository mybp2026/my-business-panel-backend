// src/docs/contexts/general/tenant/update-tenant.doc.ts
export const updateTenantDoc = {
  dto: {
    tenant_name: {
      description: 'New legal or commercial name. Optional.',
      example: 'Acme Corp Updated',
    },
    contact_email: {
      description: 'New primary contact email. Optional.',
      example: 'newemail@acme.com',
    },
    is_subscribed: {
      description: 'Update the subscription status. Optional.',
      example: false,
    },
    region_id: {
      description: 'New region ID. Optional.',
      example: 2,
    },
    identification: {
      description: 'New legal identification number. Optional.',
      example: '3-101-999999',
    },
    economic_activity: {
      description: 'New economic activity description. Optional.',
      example: 'Retail Commerce',
    },
    sign: {
      description: 'New commercial sign. Optional.',
      example: 'ACMEv2',
    },
  },

  operation: {
    summary: 'Update a tenant',
    description:
      'Partially updates the fields of an existing tenant. At least one field must be provided.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Tenant updated successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Tenant updated successfully' },
          tenant: {
            type: 'object',
            properties: {
              tenant_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
              tenant_name: { type: 'string', example: 'Acme Corp Updated' },
            },
          },
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
