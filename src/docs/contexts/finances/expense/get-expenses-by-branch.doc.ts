// src/docs/contexts/finances/expense/get-expenses-by-branch.doc.ts
export const getExpensesByBranchDoc = {
  operation: {
    summary: 'Gastos por sucursal',
  },

  responses: {
    200: {
      status: 200,
      description: 'Gastos registrados en la sucursal indicada.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            expense_id: { type: 'string', example: '9e1b4c73-f2a8-4d5b-b0c7-3e6d9f1a2b84' },
            branch_id: { type: 'string', example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94' },
            amount: { type: 'number', example: 45000 },
            total_amount: { type: 'number', example: 50850 },
            expense_date: { type: 'string', example: '2024-04-01' },
          },
        },
      },
    },
  },
};
