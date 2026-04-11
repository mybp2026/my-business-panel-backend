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
  },
};
