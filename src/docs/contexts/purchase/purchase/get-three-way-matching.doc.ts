// src/docs/contexts/purchase/purchase/get-three-way-matching.doc.ts
export const getThreeWayMatchingDoc = {
  operation: {
    summary: 'Obtener resultado de conciliación a tres vías',
    description:
      'Retorna el registro de conciliación a tres vías de una orden de compra. Devuelve matching_found: false si aún no existe ningún registro.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Resultado de la conciliación a tres vías.',
      schema: {
        type: 'object',
        properties: {
          matching_found: { type: 'boolean', example: true },
          matching_id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          purchase_order_id: {
            type: 'string',
            example: '223e4567-e89b-12d3-a456-426614174000',
          },
          goods_receipt_id: {
            type: 'string',
            example: '323e4567-e89b-12d3-a456-426614174000',
          },
          supplier_invoice_id: {
            type: 'string',
            example: '423e4567-e89b-12d3-a456-426614174000',
          },
          amounts_matched: { type: 'boolean', example: true },
          quantities_matched: { type: 'boolean', example: true },
          is_matched: { type: 'boolean', example: true },
          matched_at: { type: 'string', example: '2026-04-09T12:00:00.000Z' },
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
