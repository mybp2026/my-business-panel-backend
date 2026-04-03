export const updateCategoryDoc = {
  dto: {
    name: {
      description: 'Nuevo nombre de la categoría',
      example: 'Bebidas Frías',
    },
  },
  operation: {
    summary: 'Actualizar categoría de producto',
    description: 'Actualiza el nombre de una categoría de producto existente.',
  },
  params: {
    id: { description: 'ID de la categoría a actualizar', example: '1' },
  },
  responses: {
    200: { status: 200, description: 'Categoría actualizada exitosamente' },
    400: { status: 400, description: 'Datos inválidos o faltantes' },
  },
};
