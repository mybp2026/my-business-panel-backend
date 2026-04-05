export const findReturnsDoc = {
  operation: {
    summary: 'Buscar devoluciones',
    description: 'Retorna devoluciones filtradas por invoice_id, tenant_customer_id, estado, método de reembolso y rango de fechas. Todos los filtros son opcionales.',
  },
  responses: {
    200: { status: 200, description: 'Lista de devoluciones que coinciden con los filtros' },
  },
};
