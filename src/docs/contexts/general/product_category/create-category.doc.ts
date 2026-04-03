export const createCategoryDoc = {
  dto: {
    name: {
      description: 'Nombre de la categoría de producto',
      example: 'Bebidas',
    },
  },
  operation: {
    summary: 'Crear nueva categoría de producto',
    description: 'Crea una nueva categoría para clasificar los productos del sistema.',
  },
  responses: {
    201: { status: 201, description: 'Categoría creada exitosamente' },
    400: { status: 400, description: 'Datos inválidos o faltantes' },
  },
};
