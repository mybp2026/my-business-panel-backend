// src/docs/contexts/hr/employee/delete-employee.doc.ts
export const deleteEmployeeDoc = {
  operation: {
    summary: 'Delete an employee',
    description: 'Permanently removes an employee and their associated data from the system.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Employee deleted.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Employee deleted' },
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
