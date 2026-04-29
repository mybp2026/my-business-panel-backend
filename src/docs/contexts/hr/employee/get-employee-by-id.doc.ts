// src/docs/contexts/hr/employee/get-employee-by-id.doc.ts
export const getEmployeeByIdDoc = {
  operation: {
    summary: 'Get employee by ID',
    description: 'Retrieves the full profile of an employee including their contract details.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Employee found.',
      schema: {
        type: 'object',
        properties: {
          employee_id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          first_name: { type: 'string', example: 'Juan' },
          last_name: { type: 'string', example: 'Pérez' },
          email: { type: 'string', example: 'juan.perez@empresa.com' },
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
