export const deleteCategoryDoc = {
  operation: {
    summary: 'Eliminar categoría de producto',
    description: 'Elimina una categoría de producto del sistema usando su ID.',
  },
  params: {
    id: { description: 'ID de la categoría a eliminar', example: '1' },
  },
  responses: {
    200: { status: 200, description: 'Categoría eliminada exitosamente' },
    400: { status: 400, description: 'ID inválido' },
  },
};
