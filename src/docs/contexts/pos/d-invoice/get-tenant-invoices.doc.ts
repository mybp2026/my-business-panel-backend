export const getTenantDInvoicesDoc = {
  operation: {
    summary: 'Obtener facturas por tenant',
    description: 'Retorna todas las facturas digitales asociadas a un tenant, dado su ID.',
  },
  responses: {
    200: { status: 200, description: 'Lista de facturas del tenant' },
  },
};
