// src/docs/contexts/pos/sale/get-all-sales-by-branch.doc.ts
export const getAllSalesByBranchDoc = {
  operation: {
    summary: 'Ventas por sucursal',
  },

  responses: {
    200: {
      status: 200,
      description: 'Listado paginado de ventas de la sucursal.',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sale_id: { type: 'string', example: 'f6a1b2c3-d4e5-6789-fabc-345678901234' },
                branch_id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                tenant_customer_id: { type: 'string', example: 'c3d4e5f6-a1b2-3456-cdef-012345678901' },
                created_at: { type: 'string', example: '2024-04-01T10:30:00.000Z' },
              },
            },
          },
          total: { type: 'number', example: 48 },
          page: { type: 'number', example: 1 },
          limit: { type: 'number', example: 10 },
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
