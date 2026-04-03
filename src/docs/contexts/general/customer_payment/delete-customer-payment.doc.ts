export const deleteCustomerPaymentDoc = {
  operation: {
    summary: 'Eliminar pago de cliente',
    description: 'Elimina un registro de pago del sistema usando su ID.',
  },
  params: {
    id: { description: 'ID del pago a eliminar', example: '123e4567-e89b-12d3-a456-426614174000' },
  },
  responses: {
    200: { status: 200, description: 'Pago eliminado exitosamente' },
    400: { status: 400, description: 'ID inválido' },
  },
};
