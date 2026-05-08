// src/docs/contexts/pos/cash_register/find.doc.ts
export const findCashRegistersDoc = {
  operation: {
    summary: 'Listar cajas registradoras',
  },

  responses: {
    200: {
      status: 200,
      description: 'Listado de cajas. Si se pasa branch_id como query param, filtra por sucursal.',
      schema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                cash_register_id: { type: 'string', example: 'a4c82f17-9b3e-4d6a-8c5f-1e0b7d3a2c94' },
                branch_id: { type: 'string', example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94' },
                register_name: { type: 'string', example: 'Caja Principal' },
                is_active: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'No autorizado.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
