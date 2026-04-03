export const deleteDocumentTypeDoc = {
  operation: {
    summary: 'Eliminar tipo de documento',
    description: 'Elimina un tipo de documento del sistema usando su ID.',
  },
  params: {
    id: { description: 'ID del tipo de documento a eliminar', example: '1' },
  },
  responses: {
    200: { status: 200, description: 'Tipo de documento eliminado exitosamente' },
    400: { status: 400, description: 'ID inválido' },
  },
};
