export const getCustomerPaymentsDoc = {
  operation: {
    summary: 'Obtener pagos de un cliente',
    description: 'Retorna todos los pagos asociados a un cliente específico usando su ID.',
  },
  params: {
    id: { description: 'ID del cliente', example: '123e4567-e89b-12d3-a456-426614174000' },
  },
  responses: {
    200: { status: 200, description: 'Pagos del cliente obtenidos exitosamente' },
  },
};
