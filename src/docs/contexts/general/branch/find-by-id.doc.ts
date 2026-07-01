// src/docs/contexts/general/branch/find-by-id.doc.ts
export const findBranchByIdDoc = {
  operation: {
    summary: 'Get branch by ID',
    description: 'Returns a single branch record by its UUID identifier.',
  },
  responses: {
    200: {
      status: 200,
      description: 'Branch found.',
      schema: {
        type: 'object',
        properties: {
          branch_id: {
            type: 'string',
            example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94',
          },
          branch_name: { type: 'string', example: 'Sucursal Central' },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Unauthorized' } },
      },
    },
    404: {
      status: 404,
      description: 'Branch not found.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Branch not found' } },
      },
    },
  },
};
