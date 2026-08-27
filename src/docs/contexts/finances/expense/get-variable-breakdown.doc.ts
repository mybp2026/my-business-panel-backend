export const getVariableBreakdownDoc = {
  operation: {
    summary: 'Desglose de gastos variables por categoría',
  },
  responses: {
    200: {
      status: 200,
      description:
        'Lista de categorías variables con sus totales, incluyendo gastos POS aprobados.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category_id: {
              type: 'string',
              example: '7a1b3c92-f2e8-4d5b-b0c7-3e6d9f1a2b84',
            },
            category_name: { type: 'string', example: 'Materiales de oficina' },
            account_code: { type: 'string', example: '5200' },
            total_amount: { type: 'string', example: '87500.00' },
          },
        },
      },
    },
  },
};
