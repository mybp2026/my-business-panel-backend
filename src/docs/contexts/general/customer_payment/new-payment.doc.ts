export const newPaymentDoc = {
  dto: {
    tenant_customer_id: {
      description: 'UUID del cliente asociado al tenant',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    sale_id: {
      description: 'UUID de la venta asociada al pago (opcional)',
      example: '456e7890-e89b-12d3-a456-426614174001',
    },
    payment_method_id: {
      description: 'ID del método de pago (ej: 1=Efectivo, 2=Tarjeta)',
      example: 1,
    },
    payment_amount: {
      description: 'Monto del pago',
      example: 15000,
    },
    payment_date: {
      description: 'Fecha del pago en formato ISO',
      example: '2026-03-30T12:00:00.000Z',
    },
    currency_id: {
      description: 'ID de la moneda utilizada (ej: 1=CRC, 2=USD)',
      example: 1,
    },
    verified: {
      description: 'Indica si el pago fue verificado',
      example: false,
    },
  },
  operation: {
    summary: 'Registrar nuevo pago de cliente',
    description: 'Crea un nuevo registro de pago de cliente en el sistema.',
  },
  responses: {
    201: { status: 201, description: 'Pago creado exitosamente' },
    400: { status: 400, description: 'Datos inválidos o faltantes en el body' },
  },
};
