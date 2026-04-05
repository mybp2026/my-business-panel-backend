export const getPurchaseOrderByIdDoc = {
  operation: {
    summary: 'Obtener orden de compra por ID',
    description: 'Retorna el detalle de una orden de compra dado su ID. Requiere autenticación.',
  },
  responses: {
    200: { status: 200, description: 'Detalle de la orden de compra' },
    401: { status: 401, description: 'No autorizado' },
  },
};
