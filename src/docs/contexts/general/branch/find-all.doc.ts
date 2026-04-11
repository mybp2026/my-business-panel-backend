// src/docs/contexts/general/branch/find-all.doc.ts
export const findAllBranchesDoc = {
  operation: {
    summary: 'Get all branches for the tenant',
    description: 'Returns all branches that belong to the authenticated user\'s tenant.',
  },
  responses: {
    200: {
      status: 200,
      description: 'List of branches.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            branch_id: { type: 'string', example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94' },
            branch_name: { type: 'string', example: 'Sucursal Central' },
            is_main_branch: { type: 'boolean', example: true },
          },
        },
      },
    },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
  },
};
