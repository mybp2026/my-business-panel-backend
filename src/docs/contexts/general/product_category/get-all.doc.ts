export const getAllCategoriesDoc = {
  operation: {
    summary: 'Obtener todas las categorías de productos',
    description: 'Retorna la lista completa de categorías de productos registradas en el sistema.',
  },
  responses: {
    200: { status: 200, description: 'Lista de categorías obtenida exitosamente' },
  },
};
