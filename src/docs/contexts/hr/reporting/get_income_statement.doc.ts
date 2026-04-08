// src/docs/contexts/hr/reporting/get_income_statement.doc.ts
export const getIncomeStatementDoc = {
  operation: {
    summary: 'Estado de resultados',
    description: 'Ingresos, gastos y utilidad neta del período.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Datos del período.',
      schema: {
        type: 'object',
        properties: {
          total_income: { type: 'number', example: 4850000 },
          total_expenses: { type: 'number', example: 3120000 },
          net_income: { type: 'number', example: 1730000 },
          period_start: { type: 'string', example: '2024-01-01' },
          period_end: { type: 'string', example: '2024-01-31' },
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
