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
  },
};
