// src/docs/contexts/purchase/purchase/update-purchase-order.doc.ts
export const updatePurchaseOrderDoc = {
  dto: {
    supplier_id: {
      description: 'UUID del proveedor (opcional).',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    warehouse_id: {
      description: 'UUID del almacén de destino (opcional).',
      example: '223e4567-e89b-12d3-a456-426614174000',
    },
    expected_delivery_date: {
      description: 'Fecha de entrega esperada en formato ISO 8601 (opcional).',
      example: '2026-06-01',
    },
    payment_condition: {
      description: 'Condición de pago: CREDIT o IN_FULL (opcional).',
      example: 'IN_FULL',
    },
  },

  operation: {
    summary: 'Actualizar orden de compra',
    description:
      'Actualiza los campos de una orden de compra existente según su ID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Orden de compra actualizada exitosamente.',
      schema: {
        type: 'object',
        properties: {
          purchase_order_id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          purchase_order_status_id: { type: 'number', example: 1 },
          expected_delivery_date: { type: 'string', example: '2026-06-01' },
        },
      },
    },
    401: {
      status: 401,
      description: 'No autorizado — token ausente o inválido.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
