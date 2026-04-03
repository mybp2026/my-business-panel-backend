export const deleteMarginDoc = {
  operation: {
    summary: 'Eliminar margen de segmento',
    description: 'Elimina un margen de segmento del sistema usando su ID.',
  },
  params: {
    id: { description: 'ID del margen a eliminar', example: '123e4567-e89b-12d3-a456-426614174000' },
  },
  responses: {
    200: { status: 200, description: 'Margen eliminado exitosamente' },
    400: { status: 400, description: 'ID inválido' },
  },
};
