export const getCustomerDInvoicesDoc = {
  operation: {
    summary: 'Obtener facturas por cliente',
    description: 'Retorna las facturas digitales de un cliente específico dentro de un tenant, filtradas por tenant_id y número de documento del cliente (query params: id, doc).',
  },
  responses: {
    200: { status: 200, description: 'Lista de facturas del cliente' },
  },
};
