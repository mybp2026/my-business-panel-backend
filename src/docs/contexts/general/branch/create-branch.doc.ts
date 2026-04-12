// src/docs/contexts/general/branch/create-branch.doc.ts
export const createBranchDoc = {
  dto: {
    tenant_id: { description: 'UUID of the tenant this branch belongs to.', example: '123e4567-e89b-12d3-a456-426614174000' },
    branch_name: { description: 'Name of the branch.', example: 'Sucursal Central' },
    address: { description: 'Physical address of the branch. Optional.', example: 'Avenida Central 123, San José' },
    contact_email: { description: 'Contact email for the branch. Optional.', example: 'central@mybusiness.com' },
    branch_number: { description: 'Unique branch number or code.', example: 'BR-001' },
    is_main_branch: { description: 'Whether this is the main branch. Defaults to true.', example: true },
  },
  operation: {
    summary: 'Create a new branch',
    description: 'Creates a new branch associated with the authenticated user\'s tenant.',
  },
  responses: {
    201: {
      status: 201,
      description: 'Branch created successfully.',
      schema: {
        type: 'object',
        properties: {
          branch_id: { type: 'string', example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94' },
          branch_name: { type: 'string', example: 'Sucursal Central' },
        },
      },
    },
    400: { status: 400, description: 'Invalid data.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Bad Request' } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
  },
};
