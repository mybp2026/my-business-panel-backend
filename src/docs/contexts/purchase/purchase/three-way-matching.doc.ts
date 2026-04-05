export const threeWayMatchingDoc = {
  dto: {
    purchase_order_id: {
      description: 'UUID de la orden de compra a conciliar',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    goods_receipt_id: {
      description: 'UUID del recibo de mercancía asociado',
      example: '123e4567-e89b-12d3-a456-426614174001',
    },
  },
  operation: {
    summary: 'Ejecutar three-way matching',
    description: 'Concilia una orden de compra con su recibo de mercancía y factura del proveedor. Requiere autenticación.',
  },
  responses: {
    201: { status: 201, description: 'Three-way matching ejecutado exitosamente' },
    400: { status: 400, description: 'purchase_order_id o goods_receipt_id faltantes' },
    401: { status: 401, description: 'No autorizado' },
  },
};
