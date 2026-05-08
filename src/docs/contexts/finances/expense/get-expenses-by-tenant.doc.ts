// src/docs/contexts/finances/expense/get-expenses-by-tenant.doc.ts
export const getExpensesByTenantDoc = {
  operation: {
    summary: 'Gastos del tenant',
  },

  responses: {
    200: {
      status: 200,
      description: 'Todos los gastos registrados para el tenant.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            expense_id: { type: 'string', example: '9e1b4c73-f2a8-4d5b-b0c7-3e6d9f1a2b84' },
            category_id: { type: 'string', example: '4c9f3b82-a1e7-4d5c-b0d6-8e2f1a3c7b94' },
            amount: { type: 'number', example: 45000 },
            total_amount: { type: 'number', example: 50850 },
            expense_date: { type: 'string', example: '2024-04-01' },
            payment_method: { type: 'string', example: 'TRANSFER' },
          },
        },
      },
    },
  },
};
