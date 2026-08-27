export const getFixedBreakdownDoc = {
  operation: {
    summary: 'Desglose de gastos fijos por categoría',
  },
  responses: {
    200: {
      status: 200,
      description:
        'Lista de categorías fijas activas con sus totales en el rango indicado.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category_id: {
              type: 'string',
              example: '4c9f3b82-a1e7-4d5c-b0d6-8e2f1a3c7b94',
            },
            category_name: { type: 'string', example: 'Alquiler' },
            account_code: { type: 'string', example: '5100' },
            total_amount: { type: 'string', example: '650000.00' },
          },
        },
      },
    },
  },
};
