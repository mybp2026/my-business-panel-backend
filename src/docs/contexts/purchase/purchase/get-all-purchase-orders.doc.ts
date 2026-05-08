// src/docs/contexts/purchase/purchase/get-all-purchase-orders.doc.ts
export const getAllPurchaseOrdersDoc = {
  operation: {
    summary: 'Listar órdenes de compra',
    description: 'Retorna todas las órdenes de compra del tenant del usuario autenticado.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Listado de órdenes de compra del tenant.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            purchase_order_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            supplier_id: { type: 'string', example: '223e4567-e89b-12d3-a456-426614174000' },
            warehouse_id: { type: 'string', example: '323e4567-e89b-12d3-a456-426614174000' },
            purchase_order_status_id: { type: 'number', example: 1 },
            expected_delivery_date: { type: 'string', example: '2026-05-01' },
            payment_condition: { type: 'string', example: 'CREDIT' },
          },
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
