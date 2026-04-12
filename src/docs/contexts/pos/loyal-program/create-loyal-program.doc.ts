// src/docs/contexts/pos/loyal-program/create-loyal-program.doc.ts
export const createLoyalProgramDoc = {
  dto: {
    tenant_id: {
      description: 'UUID del tenant al que pertenece el programa.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    points_earned_per_currency_unit: {
      description: 'Puntos que el cliente gana por cada unidad de moneda gastada.',
      example: 1,
    },
    points_redeemed_per_currency_unit: {
      description: 'Valor en moneda que equivale a un punto al momento de canje.',
      example: 0.5,
    },
    minimum_purchase_for_points: {
      description: 'Monto mínimo de compra para acumular puntos. Opcional.',
      example: 1000,
    },
  },

  operation: {
    summary: 'Create loyalty program',
    description: 'Creates a new loyalty program for a tenant.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Loyalty program created.',
      schema: {
        type: 'object',
        properties: {
          loyal_program_id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid data.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
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
