// src/docs/contexts/pos/promos/update-promotion.doc.ts
export const updatePromotionDoc = {
  operation: {
    summary: 'Actualizar promoción',
  },

  responses: {
    200: {
      status: 200,
      description: 'Promoción actualizada exitosamente.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Promotion updated successfully' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Datos inválidos.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
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
