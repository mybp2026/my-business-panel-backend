export const getPromoTypesDoc = {
  operation: {
    summary: 'Obtener tipos de promoción',
    description: 'Retorna el catálogo de tipos de promoción disponibles en el sistema.',
  },
  responses: {
    200: { status: 200, description: 'Lista de tipos de promoción' },
  },
};
