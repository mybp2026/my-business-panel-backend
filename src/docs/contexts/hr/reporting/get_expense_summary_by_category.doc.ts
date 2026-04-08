// src/docs/contexts/hr/reporting/get_expense_summary_by_category.doc.ts
export const getExpenseSummaryByCategoryDoc = {
  operation: {
    summary: 'Resumen de gastos por categoría',
  },

  responses: {
    200: {
      status: 200,
      description: 'Gastos agrupados por categoría.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string', example: 'Planilla' },
            total_amount: { type: 'number', example: 2340000 },
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
