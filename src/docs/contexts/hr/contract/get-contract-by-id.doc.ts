// src/docs/contexts/hr/contract/get-contract-by-id.doc.ts
export const getContractByIdDoc = {
  operation: {
    summary: 'Get contract by ID',
    description:
      'Retrieves the full details of an employee contract by its UUID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Contract found.',
      schema: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
          start_date: { type: 'string', example: '2024-01-01' },
          end_date: { type: 'string', example: '2024-12-31' },
          base_salary: { type: 'number', example: 800000 },
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
      description: 'Contract not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Contract not found' },
        },
      },
    },
  },
};
