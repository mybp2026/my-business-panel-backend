// src/docs/contexts/hr/incapacity/update-incapacity.doc.ts
export const updateIncapacityDoc = {
  dto: {
    type: {
      description: 'Tipo de incapacidad (opcional): CCSS o INS.',
      example: 'INS',
    },
    period_start: {
      description: 'Nueva fecha de inicio de la incapacidad (opcional).',
      example: '2024-02-06',
    },
    period_end: {
      description: 'Nueva fecha de finalización de la incapacidad (opcional).',
      example: '2024-02-15',
    },
    days_paying: {
      description: 'Cantidad de días a pagar actualizada (opcional).',
      example: 9,
    },
    percentage_to_pay: {
      description: 'Porcentaje del salario a pagar actualizado (opcional).',
      example: 80,
    },
  },

  operation: {
    summary: 'Actualizar incapacidad',
    description: 'Solo se modifican los campos enviados.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Incapacidad actualizada.',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Incapacity updated successfully',
          },
          incapacity_id: {
            type: 'string',
            example: 'b2c3d4e5-f6a7-8901-bcde-234567890123',
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
