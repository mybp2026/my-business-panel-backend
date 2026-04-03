export const getAllPaymentsDoc = {
  operation: {
    summary: 'Obtener todos los pagos',
    description: 'Retorna la lista completa de pagos de clientes registrados en el sistema.',
  },
  responses: {
    200: { status: 200, description: 'Lista de pagos obtenida exitosamente' },
  },
};
