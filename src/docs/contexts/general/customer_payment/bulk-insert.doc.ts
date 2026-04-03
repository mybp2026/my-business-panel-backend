export const bulkInsertDoc = {
  dto: {
    payments: {
      description: 'Arreglo de pagos a insertar en lote',
      example: [
        {
          tenant_customer_id: '123e4567-e89b-12d3-a456-426614174000',
          payment_method_id: 1,
          payment_amount: 5000,
          payment_date: '2026-03-30T12:00:00.000Z',
          currency_id: 1,
          verified: false,
        },
      ],
    },
    sale_id: {
      description: 'UUID de la venta a la que pertenecen todos los pagos del lote',
      example: '456e7890-e89b-12d3-a456-426614174001',
    },
  },
  operation: {
    summary: 'Insertar pagos en lote',
    description: 'Inserta múltiples pagos de clientes asociados a una misma venta en una sola operación.',
  },
  responses: {
    201: { status: 201, description: 'Pagos insertados exitosamente' },
    400: { status: 400, description: 'Datos inválidos o arreglo de pagos vacío' },
  },
};
