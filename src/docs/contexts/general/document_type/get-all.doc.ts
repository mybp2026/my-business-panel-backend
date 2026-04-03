export const getAllDocumentTypesDoc = {
  operation: {
    summary: 'Obtener todos los tipos de documentos',
    description: 'Retorna la lista completa de tipos de documentos registrados en el sistema.',
  },
  responses: {
    200: { status: 200, description: 'Lista de tipos de documentos obtenida exitosamente' },
  },
};
