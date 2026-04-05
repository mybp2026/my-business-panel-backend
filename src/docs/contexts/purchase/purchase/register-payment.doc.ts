export const registerPaymentDoc = {
  dto: {
    purchase_account_payable_id: {
      description: 'UUID de la cuenta por pagar asociada a la orden',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    amount_paid: {
      description: 'Monto a pagar (mínimo 0.01)',
      example: 150000,
    },
    payment_method_id: {
      description: 'ID del método de pago',
      example: 1,
    },
    payment_reference: {
      description: 'Referencia opcional del pago (número de transferencia, cheque, etc.)',
      example: 'TRF-20260405-001',
    },
  },
  operation: {
    summary: 'Registrar pago de orden de compra',
    description: 'Registra un pago hacia un proveedor sobre una cuenta por pagar. Genera automáticamente el asiento contable correspondiente. Opera en transacción atómica. Requiere autenticación.',
  },
  responses: {
    201: { status: 201, description: 'Pago registrado exitosamente' },
    400: { status: 400, description: 'Error al registrar el pago o datos inválidos' },
    401: { status: 401, description: 'No autorizado' },
  },
};
