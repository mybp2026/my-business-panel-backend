// src/docs/contexts/purchase/payment_alerts/find-all-payment-alerts.doc.ts
export const findAllPaymentAlertsDoc = {
  operation: {
    summary: 'Listar alertas de pago',
  },

  responses: {
    200: {
      status: 200,
      description: 'Listado de alertas de pago registradas.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            payment_alert_id: { type: 'number', example: 1 },
            description: { type: 'string', example: 'Pago vence en 3 días' },
          },
        },
      },
    },
  },
};
