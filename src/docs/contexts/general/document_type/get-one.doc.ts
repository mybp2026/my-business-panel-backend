export const getOneDocumentTypeDoc = {
  operation: {
    summary: 'Obtener un tipo de documento por ID',
    description: 'Retorna la información de un tipo de documento específico usando su ID.',
  },
  params: {
    id: { description: 'ID del tipo de documento', example: '1' },
  },
  responses: {
    200: { status: 200, description: 'Tipo de documento obtenido exitosamente' },
    400: { status: 400, description: 'ID inválido' },
  },
};
