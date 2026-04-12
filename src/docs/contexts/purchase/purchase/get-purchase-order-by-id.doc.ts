// src/docs/contexts/purchase/purchase/get-purchase-order-by-id.doc.ts
export const getPurchaseOrderByIdDoc = {
  operation: {
    summary: 'Obtener orden de compra por ID',
    description: 'Retorna una orden de compra según su UUID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Orden de compra encontrada.',
      schema: {
        type: 'object',
        properties: {
          purchase_order_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          supplier_id: { type: 'string', example: '223e4567-e89b-12d3-a456-426614174000' },
          warehouse_id: { type: 'string', example: '323e4567-e89b-12d3-a456-426614174000' },
          purchase_order_status_id: { type: 'number', example: 2 },
          expected_delivery_date: { type: 'string', example: '2026-05-01' },
          payment_condition: { type: 'string', example: 'IN_FULL' },
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
    404: {
      status: 404,
      description: 'Orden de compra no encontrada.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Not Found' },
        },
      },
    },
  },
};
