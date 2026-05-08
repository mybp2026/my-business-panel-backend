// src/docs/contexts/hr/turns/create-turn.doc.ts
export const createTurnDoc = {
  dto: {
    branch_id: {
      description: 'UUID de la sucursal a la que pertenece este turno.',
      example: 'd7e8f9a0-b1c2-3456-defa-567890123456',
    },
    entry: {
      description: 'Hora de entrada del turno en formato HH:mm.',
      example: '08:00',
    },
    out: {
      description: 'Hora de salida del turno en formato HH:mm.',
      example: '17:00',
    },
  },

  operation: {
    summary: 'Crear turno',
  },

  responses: {
    201: {
      status: 201,
      description: 'Turno creado.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Turn created successfully' },
          turn_id: { type: 'string', example: 'e9f0a1b2-c3d4-5678-efab-678901234567' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Datos inválidos o faltantes en el cuerpo de la solicitud.',
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
