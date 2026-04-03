export const handleWebhookDoc = {
  operation: {
    summary: 'Webhook de eventos de Stripe',
    description: `Recibe notificaciones de eventos de Stripe relacionados con suscripciones y pagos.
      Este endpoint NO debe llamarse manualmente — es invocado exclusivamente por Stripe.

      Eventos manejados:
      - invoice.payment_succeeded: Verifica el pago del tenant en la base de datos.
      - customer.subscription.created: Registra la creación de una nueva suscripción.
      - customer.subscription.updated: Actualiza o cancela la suscripción si corresponde.
      - customer.subscription.deleted: Cancela la suscripción del tenant.

      Requiere el header "stripe-signature" para verificar la autenticidad del evento.`,
  },
  responses: {
    200: { status: 200, description: 'Webhook recibido y procesado exitosamente' },
    400: { status: 400, description: 'Firma de Stripe inválida o body vacío' },
  },
};
