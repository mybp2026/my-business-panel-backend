// src/docs/contexts/hr/clocking/clock-in.doc.ts
export const clockInDoc = {
  dto: {
    employeeId: {
      description: 'UUID of the employee registering the clock-in.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    branchId: {
      description: 'UUID of the branch where the clock-in is being registered.',
      example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94',
    },
  },

  operation: {
    summary: 'Register clock-in',
    description: 'Records the entry time for an employee at a specific branch.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Clock-in registered successfully.',
      schema: {
        type: 'object',
        properties: {
          clocking_id: {
            type: 'string',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
        },
      },
    },
    400: {
      status: 400,
      description: 'The employee is already clocked in or the data is invalid.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Employee already clocked in' },
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
