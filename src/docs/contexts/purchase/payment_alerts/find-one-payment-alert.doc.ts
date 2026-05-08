// src/docs/contexts/purchase/payment_alerts/find-one-payment-alert.doc.ts
export const findOnePaymentAlertDoc = {
  operation: {
    summary: 'Obtener alerta de pago por ID',
  },

  responses: {
    200: {
      status: 200,
      description: 'Datos de la alerta de pago.',
      schema: {
        type: 'object',
        properties: {
          payment_alert_id: { type: 'number', example: 1 },
          description: { type: 'string', example: 'Pago vence en 3 días' },
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
