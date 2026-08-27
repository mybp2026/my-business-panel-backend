// src/docs/contexts/hr/reporting/get_profitability_by_product.doc.ts
export const getProfitabilityByProductDoc = {
  operation: {
    summary: 'Rentabilidad por producto',
  },

  responses: {
    200: {
      status: 200,
      description: 'Rentabilidad por producto.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            product_id: {
              type: 'string',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
            product_name: { type: 'string', example: 'Café molido 250g' },
            total_sold: { type: 'number', example: 312 },
            total_cost: { type: 'number', example: 187200 },
            profit: { type: 'number', example: 93600 },
            margin_percentage: { type: 'number', example: 33.33 },
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
