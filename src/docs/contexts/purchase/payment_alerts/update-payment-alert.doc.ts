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
  },
};
