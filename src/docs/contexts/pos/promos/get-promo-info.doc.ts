// src/docs/contexts/pos/promos/get-promo-info.doc.ts
export const getPromoInfoDoc = {
  operation: {
    summary: 'Detalle de una promoción',
  },

  responses: {
    200: {
      status: 200,
      description:
        'Información completa de la promoción incluyendo sus reglas.',
      schema: {
        type: 'object',
        properties: {
          promotion_id: {
            type: 'string',
            example: 'b3c4d5e6-f7a8-9012-bcde-f23456789012',
          },
          promotion_name: { type: 'string', example: '2x1 en bebidas' },
          promotion_code: { type: 'string', example: 'BEBE2X1' },
          promotion_description: {
            type: 'string',
            example: 'Por cada bebida comprada llevas otra gratis',
          },
          promotion_type_id: { type: 'number', example: 2 },
          is_active: { type: 'boolean', example: true },
          promotion_start_date: { type: 'string', example: '2024-04-01' },
          promotion_end_date: { type: 'string', example: '2024-04-30' },
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
      description: 'Promoción no encontrada.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Not Found' },
        },
      },
    },
  },
};
