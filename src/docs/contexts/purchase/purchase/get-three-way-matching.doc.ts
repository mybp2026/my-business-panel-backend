export const getThreeWayMatchingDoc = {
  operation: {
    summary: 'Obtener conciliación three-way matching por orden',
    description: 'Retorna el resultado de la conciliación three-way matching de una orden de compra. Si no existe conciliación retorna matching_found: false. Requiere autenticación.',
  },
  responses: {
    200: { status: 200, description: 'Resultado de la conciliación' },
    401: { status: 401, description: 'No autorizado' },
  },
};
