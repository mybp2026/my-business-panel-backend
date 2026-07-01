// src/docs/contexts/hr/turns/update-turn.doc.ts
export const updateTurnDoc = {
  dto: {
    entry: {
      description: 'Nueva hora de entrada del turno (opcional).',
      example: '07:30',
    },
    out: {
      description: 'Nueva hora de salida del turno (opcional).',
      example: '16:30',
    },
  },

  operation: {
    summary: 'Actualizar turno',
    description: 'Solo se modifican los campos enviados.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Turno actualizado.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Turn updated successfully' },
          turn_id: {
            type: 'string',
            example: 'e9f0a1b2-c3d4-5678-efab-678901234567',
          },
        },
      },
    },
    400: {
      status: 400,
      description: 'Datos inválidos en el cuerpo de la solicitud.',
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
