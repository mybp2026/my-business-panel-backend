export const createSubscriptionDoc = {
  dto: {
    tenant_id: {
      description: 'UUID del tenant que se suscribe',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    payment_method_id: {
      description: 'ID del método de pago registrado',
      example: 1,
    },
    payment_amount: {
      description: 'Monto del pago de la suscripción',
      example: 29900,
    },
    details: {
      description: 'Detalles adicionales del pago',
      example: 'Suscripción mensual plan Standard',
    },
    plan: {
      description: 'Plan de suscripción a contratar. Valores válidos: "standard", "premium", "test"',
      example: 'standard',
    },
    subscription_type_id: {
      description: 'ID del tipo de suscripción en la base de datos',
      example: 1,
    },
    start_date: {
      description: 'Fecha de inicio de la suscripción en formato ISO',
      example: '2026-04-01',
    },
    end_date: {
      description: 'Fecha de vencimiento de la suscripción en formato ISO',
      example: '2026-05-01',
    },
  },
  operation: {
    summary: 'Crear suscripción de tenant',
    description: 'Crea una nueva suscripción para un tenant. Si el tenant no existe en Stripe se registra automáticamente como customer. Retorna el ID de la suscripción, ID de la factura y el estado de la suscripción en Stripe.',
  },
  responses: {
    201: { status: 201, description: 'Suscripción creada exitosamente' },
    400: { status: 400, description: 'Datos inválidos o faltantes' },
    404: { status: 404, description: 'Tenant no encontrado' },
  },
};
