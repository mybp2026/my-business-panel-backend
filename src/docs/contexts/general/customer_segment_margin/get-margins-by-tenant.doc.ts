export const getMarginsByTenantDoc = {
  operation: {
    summary: 'Obtener márgenes por tenant',
    description: 'Retorna los márgenes de segmentos configurados para un tenant específico.',
  },
  params: {
    tenantId: { description: 'UUID del tenant', example: '123e4567-e89b-12d3-a456-426614174000' },
  },
  responses: {
    200: { status: 200, description: 'Márgenes del tenant obtenidos exitosamente' },
  },
};
