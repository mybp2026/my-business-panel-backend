// src/docs/contexts/purchase/payment_alerts/update-payment-alert.doc.ts
export const updatePaymentAlertDoc = {
  dto: {},

  operation: {
    summary: 'Actualizar alerta de pago',
  },

  responses: {
    200: {
      status: 200,
      description: 'Alerta de pago actualizada.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Payment alert updated' },
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
    404: {
      status: 404,
      description: 'Alerta no encontrada.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Not Found' },
        },
      },
    },
  },
};
