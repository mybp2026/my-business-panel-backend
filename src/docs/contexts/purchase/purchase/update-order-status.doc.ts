export const updateOrderStatusDoc = {
  dto: {
    status_id: {
      description: 'ID del nuevo estado de la orden (1=Pendiente, 2=Aprobada, 3=Entregada, 4=Cancelada). Transiciones permitidas: 1→2, 2→3',
      example: 2,
    },
  },
  operation: {
    summary: 'Actualizar estado de orden de compra',
    description: 'Actualiza el estado de una orden de compra siguiendo transiciones permitidas. Al pasar a estado 3 (Entregada) actualiza el inventario y genera asiento contable automáticamente. Requiere autenticación.',
  },
  responses: {
    200: { status: 200, description: 'Estado actualizado exitosamente' },
    400: { status: 400, description: 'Transición de estado no permitida' },
    401: { status: 401, description: 'No autorizado' },
    404: { status: 404, description: 'Orden no encontrada para este tenant' },
  },
};
