// src/docs/contexts/pos/promos/delete-promotion.doc.ts
export const deletePromotionDoc = {
  operation: {
    summary: 'Eliminar promoción',
  },

  responses: {
    200: {
      status: 200,
      description: 'Promoción eliminada exitosamente.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Promotion deleted successfully' },
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
    404: {
      status: 404,
      description: 'Promoción no encontrada.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Promotion not found' },
        },
      },
    },
  },
};
