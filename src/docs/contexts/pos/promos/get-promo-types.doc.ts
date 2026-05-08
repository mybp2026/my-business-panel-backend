// src/docs/contexts/pos/promos/get-promo-types.doc.ts
export const getPromoTypesDoc = {
  operation: {
    summary: 'Tipos de promoción disponibles',
  },

  responses: {
    200: {
      status: 200,
      description: 'Catálogo de tipos de promoción del sistema.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            promotion_type_id: { type: 'number', example: 1 },
            type_name: { type: 'string', example: 'Descuento porcentual' },
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
