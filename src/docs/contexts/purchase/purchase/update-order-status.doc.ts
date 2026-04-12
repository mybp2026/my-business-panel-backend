// src/docs/contexts/purchase/purchase/update-order-status.doc.ts
export const updateOrderStatusDoc = {
  dto: {
    status_id: {
      description: 'ID del estado destino. Transiciones permitidas: 1→2 (Confirmada), 2→3 (Entregada). Los estados 3 y 4 son terminales.',
      example: 2,
    },
  },

  operation: {
    summary: 'Actualizar estado de orden de compra',
    description: 'Transiciona una orden de compra al siguiente estado. Al entregar (estado 3), actualiza automáticamente el inventario y genera un asiento contable.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Estado actualizado exitosamente.',
      schema: {
        type: 'object',
        properties: {
          purchase_order_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          purchase_order_status_id: { type: 'number', example: 2 },
        },
      },
    },
    400: {
      status: 400,
      description: 'Solicitud inválida — transición de estado no permitida.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Transicion invalida: 1 -> 3' },
          error: { type: 'string', example: 'Bad Request' },
          statusCode: { type: 'number', example: 400 },
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
      description: 'Orden de compra no encontrada para este tenant.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Orden no encontrada para este tenant' },
          error: { type: 'string', example: 'Not Found' },
          statusCode: { type: 'number', example: 404 },
        },
      },
    },
  },
};
