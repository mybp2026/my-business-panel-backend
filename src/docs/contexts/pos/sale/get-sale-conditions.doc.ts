// src/docs/contexts/pos/sale/get-sale-conditions.doc.ts
export const getSaleConditionsDoc = {
  operation: {
    summary: 'Condiciones de venta disponibles',
  },

  responses: {
    200: {
      status: 200,
      description: 'Lista de condiciones de venta registradas en el sistema.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            condition_id: { type: 'string', example: 'CONTADO' },
            description: { type: 'string', example: 'Pago de contado' },
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
