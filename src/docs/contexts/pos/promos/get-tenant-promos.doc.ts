export const getTenantPromosDoc = {
  operation: {
    summary: 'Obtener promociones por tenant',
    description: 'Retorna todas las promociones activas e inactivas asociadas a un tenant específico.',
  },
  responses: {
    200: { status: 200, description: 'Lista de promociones del tenant' },
  },
};
