// src/docs/contexts/finances/expense/get-expenses-by-date-range.doc.ts
export const getExpensesByDateRangeDoc = {
  operation: {
    summary: 'Gastos por rango de fechas',
  },

  responses: {
    200: {
      status: 200,
      description: 'Gastos del tenant entre las fechas indicadas por query param (start, end).',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            expense_id: { type: 'string', example: '9e1b4c73-f2a8-4d5b-b0c7-3e6d9f1a2b84' },
            amount: { type: 'number', example: 45000 },
            total_amount: { type: 'number', example: 50850 },
            expense_date: { type: 'string', example: '2024-04-01' },
            payment_method: { type: 'string', example: 'CASH' },
          },
        },
      },
    },
  },
};
