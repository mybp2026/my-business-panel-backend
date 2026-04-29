export const getAllRegionsDoc = {
  operation: {
    summary: 'Obtener todas las regiones',
    description: 'Retorna el listado de todas las regiones disponibles en el sistema.',
  },
  responses: {
    200: { status: 200, description: 'Lista de regiones obtenida exitosamente' },
    401: { status: 401, description: 'No autorizado' },
  },
};
