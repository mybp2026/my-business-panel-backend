// src/docs/contexts/purchase/payment_alerts/remove-payment-alert.doc.ts
export const removePaymentAlertDoc = {
  operation: {
    summary: 'Eliminar alerta de pago',
  },

  responses: {
    200: {
      status: 200,
      description: 'Alerta de pago eliminada.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Payment alert removed' },
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
