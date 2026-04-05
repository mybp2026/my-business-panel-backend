export const getPromoInfoDoc = {
  operation: {
    summary: 'Obtener detalle de una promoción',
    description: 'Retorna la información completa de una promoción incluyendo sus reglas, dado su ID.',
  },
  responses: {
    200: { status: 200, description: 'Detalle de la promoción' },
  },
};
