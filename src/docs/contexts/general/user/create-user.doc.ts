// src/docs/contexts/general/user/create-user.doc.ts
export const createUserDoc = {
  dto: {
    tenant_id: {
      description: 'UUID of the tenant to which the user belongs.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    email: {
      description: 'Unique email address for the user within the tenant.',
      example: 'juan.perez@empresa.com',
    },
    password: {
      description: 'Plain text password. Will be hashed before storage.',
      example: 'MyPassword123!',
    },
    role_id: {
      description: 'Numeric ID of the role to assign (1=Admin, 2=User, 3=Viewer).',
      example: 2,
    },
    employeeInfo: {
      description: 'Employee and contract data associated with the new user.',
      example: {
        tenant_id: '123e4567-e89b-12d3-a456-426614174000',
        branch_id: '123e4567-e89b-12d3-a456-426614174001',
        first_name: 'Juan',
        last_name: 'Pérez',
        doc_number: '123456789',
        phone: '+50688889999',
        email: 'juan.perez@empresa.com',
        payment_schedule_id: 1,
        contractData: {
          start_date: '2024-01-01',
          end_date: '2025-01-01',
          hours: 40,
          base_salary: 500000,
          duties: 'Software Developer',
          turn_type: 1,
          turn_id: 1,
        },
      },
    },
  },

  operation: {
    summary: 'Create a new user',
    description:
      'Creates a user account along with the associated employee record and contract in a single transaction. Rolls back if any step fails.',
  },

  responses: {
    201: {
      status: 201,
      description: 'User created successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'user created successfully!' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid or missing fields in the request body.',
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
