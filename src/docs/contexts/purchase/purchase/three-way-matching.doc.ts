// src/docs/contexts/purchase/purchase/three-way-matching.doc.ts
export const threeWayMatchingDoc = {
  dto: {
    purchase_order_id: {
      description: 'UUID de la orden de compra a conciliar.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    goods_receipt_id: {
      description: 'UUID de la recepción de mercancía a conciliar.',
      example: '223e4567-e89b-12d3-a456-426614174000',
    },
  },

  operation: {
    summary: 'Ejecutar conciliación a tres vías',
    description:
      'Concilia una orden de compra con una recepción de mercancía para verificar que cantidades y montos coincidan.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Conciliación a tres vías ejecutada exitosamente.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Three-way matching ejecutado' },
        },
      },
    },
    400: {
      status: 400,
      description:
        'Solicitud inválida — purchase_order_id o goods_receipt_id es requerido.',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'purchase_order_id y goods_receipt_id son requeridos',
          },
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
  },
};
