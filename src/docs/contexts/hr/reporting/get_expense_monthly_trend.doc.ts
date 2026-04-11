// src/docs/contexts/hr/reporting/get_expense_monthly_trend.doc.ts
export const getExpenseMonthlyTrendDoc = {
  operation: {
    summary: 'Tendencia de gastos mensual',
  },

  responses: {
    200: {
      status: 200,
      description: 'Gastos por mes.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            month: { type: 'number', example: 3 },
            year: { type: 'number', example: 2024 },
            total_expenses: { type: 'number', example: 3120000 },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'No autorizado.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
