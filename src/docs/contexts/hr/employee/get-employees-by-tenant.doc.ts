// src/docs/contexts/hr/employee/get-employees-by-tenant.doc.ts
export const getEmployeesByTenantDoc = {
  operation: {
    summary: 'Get employees by tenant',
    description: 'Returns all employees registered under a specific tenant.',
  },

  responses: {
    200: {
      status: 200,
      description: 'List of employees.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            employee_id: {
              type: 'string',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
            first_name: { type: 'string', example: 'Juan' },
            last_name: { type: 'string', example: 'Pérez' },
          },
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
