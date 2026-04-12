// src/docs/contexts/hr/incapacity/close-incapacity.doc.ts
export const closeIncapacityDoc = {
  operation: {
    summary: 'Cerrar incapacidad',
  },

  responses: {
    200: {
      status: 200,
      description: 'Incapacidad cerrada.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Incapacity closed successfully' },
          incapacity_id: { type: 'string', example: 'b2c3d4e5-f6a7-8901-bcde-234567890123' },
        },
      },
    },
    400: {
      status: 400,
      description: 'El ID de la incapacidad no es válido o ya está cerrada.',
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
  },
};
