// src/docs/contexts/hr/reporting/get_expense_fixed_vs_variable.doc.ts
export const getExpenseFixedVsVariableDoc = {
  operation: {
    summary: 'Gastos fijos vs variables',
    description: 'Compara fijos y variables en el período.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Desglose de gastos del período.',
      schema: {
        type: 'object',
        properties: {
          fixed_expenses: { type: 'number', example: 1950000 },
          variable_expenses: { type: 'number', example: 870000 },
          total: { type: 'number', example: 2820000 },
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
