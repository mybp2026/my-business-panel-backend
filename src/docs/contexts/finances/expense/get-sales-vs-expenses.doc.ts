export const getSalesVsExpensesDoc = {
  operation: {
    summary: 'Ventas vs Gastos por período con filtro de sucursal',
  },
  responses: {
    200: {
      status: 200,
      description: 'Serie temporal con totales de ventas y gastos. Granularidad automática: ≤30d → día, ≤90d → semana, >90d → mes.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            period: { type: 'string', example: '2026-05-01' },
            total_sales: { type: 'string', example: '2340000.00' },
            total_expenses: { type: 'string', example: '890000.00' },
          },
        },
      },
    },
  },
};
