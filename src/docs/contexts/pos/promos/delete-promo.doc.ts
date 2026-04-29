export const deletePromoDoc = {
  operation: {
    summary: 'Eliminar promoción',
    description: 'Elimina permanentemente una promoción dado su ID.',
  },
  responses: {
    200: { status: 200, description: 'Promoción eliminada exitosamente' },
    500: { status: 500, description: 'Error al eliminar la promoción' },
  },
};
