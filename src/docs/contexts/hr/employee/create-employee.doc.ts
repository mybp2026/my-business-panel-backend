// src/docs/contexts/hr/employee/create-employee.doc.ts
export const createEmployeeDoc = {
  dto: {
    user_id: {
      description: 'UUID of the system user linked to this employee.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    tenant_id: {
      description: 'UUID of the tenant this employee belongs to.',
      example: '456e7890-e89b-12d3-a456-426614174000',
    },
    branch_id: {
      description: 'UUID of the branch where this employee works.',
      example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94',
    },
    first_name: {
      description: "Employee's first name.",
      example: 'Juan',
    },
    last_name: {
      description: "Employee's last name.",
      example: 'Pérez',
    },
    doc_number: {
      description: "Employee's identity document number.",
      example: '1-2345-6789',
    },
    phone: {
      description: "Employee's phone number.",
      example: '+506 8888-9999',
    },
    email: {
      description: "Employee's email address.",
      example: 'juan.perez@empresa.com',
    },
    payment_schedule_id: {
      description: 'ID of the payment schedule assigned to this employee.',
      example: 1,
    },
    contractData: {
      description: 'Contract information for the new employee.',
      example: {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        hours: 40,
        base_salary: 800000,
        duties: 'Vendedor',
        turn_type: 1,
        turn_id: 1,
      },
    },
  },

  operation: {
    summary: 'Create a new employee',
    description:
      'Creates an employee record along with their initial contract.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Employee created successfully.',
      schema: {
        type: 'object',
        properties: {
          employee_id: {
            type: 'string',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
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
  },
};
