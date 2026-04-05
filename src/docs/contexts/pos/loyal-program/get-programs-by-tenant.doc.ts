export const getLoyalProgramsByTenantDoc = {
  operation: {
    summary: 'Obtener programas de lealtad por tenant',
    description: 'Retorna todos los programas de lealtad configurados para un tenant específico.',
  },
  responses: {
    200: { status: 200, description: 'Lista de programas de lealtad del tenant' },
  },
};
