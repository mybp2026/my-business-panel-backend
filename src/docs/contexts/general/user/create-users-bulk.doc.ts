// src/docs/contexts/general/user/create-users-bulk.doc.ts
export const createUsersBulkDoc = {
  dto: {
    users: {
      description: 'Array of users to create. Each entry follows the same structure as createUser.',
      example: [
        {
          tenant_id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'ana.garcia@empresa.com',
          password: 'MyPassword123!',
          role_id: 2,
          employeeInfo: {
            tenant_id: '123e4567-e89b-12d3-a456-426614174000',
            branch_id: '123e4567-e89b-12d3-a456-426614174001',
            first_name: 'Ana',
            last_name: 'García',
            doc_number: '987654321',
            phone: '+50688887777',
            email: 'ana.garcia@empresa.com',
            payment_schedule_id: 1,
            contractData: {
              start_date: '2024-01-01',
              end_date: '2025-01-01',
              hours: 40,
              base_salary: 500000,
              duties: 'Analyst',
              turn_type: 1,
              turn_id: 1,
            },
          },
        },
      ],
    },
  },

  operation: {
    summary: 'Bulk create users',
    description:
      'Creates multiple users, employees, and contracts in a single transaction. Rolls back all inserts if any record fails.',
  },

  responses: {
    201: {
      status: 201,
      description: 'All users created successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'users created successfully!' },
          count: { type: 'number', example: 3 },
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                user_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                email: { type: 'string', example: 'ana.garcia@empresa.com' },
              },
            },
          },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid tenant ID or malformed data in one of the entries.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Invalid tenant' },
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
