// src/docs/contexts/finances/expense/get-expense-by-id.doc.ts
export const getExpenseByIdDoc = {
  operation: {
    summary: 'Detalle de un gasto',
  },

  responses: {
    200: {
      status: 200,
      description: 'Gasto encontrado.',
      schema: {
        type: 'object',
        properties: {
          expense_id: {
            type: 'string',
            example: '9e1b4c73-f2a8-4d5b-b0c7-3e6d9f1a2b84',
          },
          category_id: {
            type: 'string',
            example: '4c9f3b82-a1e7-4d5c-b0d6-8e2f1a3c7b94',
          },
          description: {
            type: 'string',
            example: 'Pago de electricidad mes de abril',
          },
          amount: { type: 'number', example: 45000 },
          tax_amount: { type: 'number', example: 5850 },
          total_amount: { type: 'number', example: 50850 },
          expense_date: { type: 'string', example: '2024-04-01' },
          payment_method: { type: 'string', example: 'TRANSFER' },
          reference_number: { type: 'string', example: 'TRF-2024-0401' },
        },
      },
    },
    404: {
      status: 404,
      description: 'Gasto no encontrado.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Gasto no encontrado' },
        },
      },
    },
  },
};
