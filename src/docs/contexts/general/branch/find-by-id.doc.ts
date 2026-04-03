export const findBranchByIdDoc = {
  operation: {
    summary: 'Obtener sucursal por ID',
    description: 'Retorna la información de una sucursal específica. Requiere autenticación y nivel de acceso 2 o superior.',
  },
  params: {
    id: { description: 'ID de la sucursal', example: '123e4567-e89b-12d3-a456-426614174000' },
  },
  responses: {
    200: { status: 200, description: 'Sucursal obtenida exitosamente' },
    401: { status: 401, description: 'No autenticado. Se requiere sesión activa' },
    403: { status: 403, description: 'Nivel de acceso insuficiente. Se requiere nivel 2 o superior' },
  },
};
