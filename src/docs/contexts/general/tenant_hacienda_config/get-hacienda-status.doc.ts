export const getHaciendaStatusDoc = {
  operation: {
    summary: 'Obtener estado de configuración Hacienda',
    description:
      'Verifica si el tenant tiene credenciales de Hacienda configuradas. No retorna credenciales en texto plano, solo el estado y el client_id. Requiere nivel de acceso 3.',
  },
  responses: {
    200: {
      status: 200,
      description: 'Estado de configuración retornado exitosamente',
    },
    401: { status: 401, description: 'No autorizado' },
  },
};
