export const updatePurchaseOrderDoc = {
  dto: {
    purchase_order_status_id: {
      description: 'ID del estado de la orden de compra',
      example: 2,
    },
  },
  operation: {
    summary: 'Actualizar orden de compra',
    description: 'Actualiza los datos de una orden de compra existente dado su ID. Requiere autenticación.',
  },
  responses: {
    200: { status: 200, description: 'Orden actualizada exitosamente' },
    401: { status: 401, description: 'No autorizado' },
  },
};
