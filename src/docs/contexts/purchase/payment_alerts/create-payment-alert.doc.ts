// src/docs/contexts/purchase/payment_alerts/create-payment-alert.doc.ts
export const createPaymentAlertDoc = {
  dto: {},

  operation: {
    summary: 'Crear alerta de pago',
  },

  responses: {
    201: {
      status: 201,
      description: 'Alerta de pago creada.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Payment alert created' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Bad request.',
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
