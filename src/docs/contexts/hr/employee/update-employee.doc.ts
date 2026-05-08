// src/docs/contexts/hr/employee/update-employee.doc.ts
export const updateEmployeeDoc = {
  operation: {
    summary: 'Update employee info',
    description: 'Updates the personal information of an existing employee.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Employee updated successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Employee updated successfully' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid data.',
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
