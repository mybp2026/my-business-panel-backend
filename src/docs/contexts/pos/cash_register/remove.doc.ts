// src/docs/contexts/pos/cash_register/remove.doc.ts
export const removeCashRegisterDoc = {
  operation: {
    summary: 'Eliminar caja registradora',
  },

  responses: {
    200: {
      status: 200,
      description: 'Caja eliminada.',
      schema: {
        type: 'object',
        properties: {
          deleted: {
            type: 'object',
            properties: {
              cash_register_id: { type: 'string', example: 'a4c82f17-9b3e-4d6a-8c5f-1e0b7d3a2c94' },
              register_name: { type: 'string', example: 'Caja Principal' },
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
