export const getAllPurchaseOrdersDoc = {
  operation: {
    summary: 'Obtener todas las órdenes de compra del tenant',
    description: 'Retorna todas las órdenes de compra asociadas al tenant del usuario autenticado. Requiere autenticación.',
  },
  responses: {
    200: { status: 200, description: 'Lista de órdenes de compra del tenant' },
    401: { status: 401, description: 'No autorizado' },
  },
};
