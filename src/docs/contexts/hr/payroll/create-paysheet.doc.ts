// src/docs/contexts/hr/payroll/create-paysheet.doc.ts
export const createPaysheetDoc = {
  dto: {
    tenantId: {
      description: 'UUID of the tenant for which the paysheet is being created.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    branchId: {
      description: 'UUID of the branch included in this paysheet.',
      example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94',
    },
    periodStart: {
      description: 'Start date of the payroll period (ISO 8601).',
      example: '2024-04-01',
    },
    periodEnd: {
      description: 'End date of the payroll period (ISO 8601).',
      example: '2024-04-30',
    },
  },

  operation: {
    summary: 'Create a paysheet header',
    description: 'Creates the header record for a new payroll period. Employees are processed separately.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Paysheet header created.',
      schema: {
        type: 'object',
        properties: {
          paysheet_id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid data or period already exists.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
