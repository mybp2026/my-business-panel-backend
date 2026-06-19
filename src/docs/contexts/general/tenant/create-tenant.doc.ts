// src/docs/contexts/general/tenant/create-tenant.doc.ts
export const createTenantDoc = {
  dto: {
    tenant_name: {
      description: 'Legal or commercial name of the tenant.',
      example: 'Acme Corp',
    },
    contact_email: {
      description: 'Primary contact email for the tenant.',
      example: 'admin@acme.com',
    },
    is_subscribed: {
      description:
        'Whether the tenant has an active subscription. Optional, defaults to false.',
      example: true,
    },
    region_id: {
      description: 'ID of the region where the tenant operates.',
      example: 1,
    },
    identification: {
      description: 'Legal identification number of the tenant (e.g. tax ID).',
      example: '3-101-123456',
    },
    economic_activity: {
      description: "Description of the tenant's economic activity.",
      example: 'Software Development',
    },
    sign: {
      description: 'Short commercial sign or abbreviation of the tenant.',
      example: 'ACME',
    },
  },

  operation: {
    summary: 'Create a new tenant',
    description: 'Registers a new tenant in the system.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Tenant created successfully.',
      schema: {
        type: 'object',
        properties: {
          tenant_id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          tenant_name: { type: 'string', example: 'Acme Corp' },
          contact_email: { type: 'string', example: 'admin@acme.com' },
          is_subscribed: { type: 'boolean', example: true },
          region_id: { type: 'number', example: 1 },
          identification: { type: 'string', example: '3-101-123456' },
          economic_activity: {
            type: 'string',
            example: 'Software Development',
          },
          sign: { type: 'string', example: 'ACME' },
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
