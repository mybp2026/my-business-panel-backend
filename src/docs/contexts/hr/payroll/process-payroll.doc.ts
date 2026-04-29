// src/docs/contexts/hr/payroll/process-payroll.doc.ts
export const processPayrollDoc = {
  dto: {
    branch_id: {
      description: 'UUID of the branch whose payroll is being processed.',
      example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94',
    },
    tenant_id: {
      description: 'UUID of the tenant.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    period_start: {
      description: 'Start date of the payroll period (ISO 8601).',
      example: '2024-04-01',
    },
    period_end: {
      description: 'End date of the payroll period (ISO 8601).',
      example: '2024-04-30',
    },
  },

  operation: {
    summary: 'Process payroll for an employee',
    description: 'Runs the payroll calculation engine for a specific employee and period, applying all applicable concepts.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Payroll processed successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Payroll processed successfully' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid data or payroll already processed for this period.',
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
    404: {
      status: 404,
      description: 'Employee or period not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Not Found' },
        },
      },
    },
  },
};
