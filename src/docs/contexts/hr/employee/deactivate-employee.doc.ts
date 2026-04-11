// src/docs/contexts/hr/employee/deactivate-employee.doc.ts
export const deactivateEmployeeDoc = {
  operation: {
    summary: 'Deactivate an employee',
    description: 'Marks an employee as inactive. Their data is preserved but they will no longer appear in active lists.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Employee deactivated.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Employee deactivated' },
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
      description: 'Employee not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Employee not found' },
        },
      },
    },
  },
};
