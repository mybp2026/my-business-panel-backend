// src/docs/contexts/pos/promos/get-tenant-promos.doc.ts
export const getTenantPromosDoc = {
  operation: {
    summary: 'Promociones del tenant',
  },

  responses: {
    200: {
      status: 200,
      description: 'Listado de promociones activas e inactivas del tenant.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            promotion_id: {
              type: 'string',
              example: 'b3c4d5e6-f7a8-9012-bcde-f23456789012',
            },
            promotion_name: { type: 'string', example: '2x1 en bebidas' },
            promotion_code: { type: 'string', example: 'BEBE2X1' },
            is_active: { type: 'boolean', example: true },
            promotion_start_date: { type: 'string', example: '2024-04-01' },
            promotion_end_date: { type: 'string', example: '2024-04-30' },
          },
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
