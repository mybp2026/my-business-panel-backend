export const deactivateHaciendaConfigDoc = {
  operation: {
    summary: 'Desactivar configuración de Hacienda',
    description: 'Desactiva las credenciales de Hacienda del tenant dado su ID. Requiere nivel de acceso 4.',
  },
  responses: {
    200: { status: 200, description: 'Configuración desactivada exitosamente' },
    401: { status: 401, description: 'No autorizado' },
    404: { status: 404, description: 'Configuración no encontrada' },
  },
};
