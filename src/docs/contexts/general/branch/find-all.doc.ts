export const findAllBranchesDoc = {
  operation: {
    summary: 'Obtener todas las sucursales del tenant',
    description: 'Retorna todas las sucursales pertenecientes al tenant del usuario autenticado. Requiere autenticación y nivel de acceso 2 o superior.',
  },
  responses: {
    200: { status: 200, description: 'Lista de sucursales obtenida exitosamente' },
    401: { status: 401, description: 'No autenticado. Se requiere sesión activa' },
    403: { status: 403, description: 'Nivel de acceso insuficiente. Se requiere nivel 2 o superior' },
  },
};
