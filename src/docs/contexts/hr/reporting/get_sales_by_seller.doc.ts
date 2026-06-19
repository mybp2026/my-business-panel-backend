// src/docs/contexts/hr/reporting/get_sales_by_seller.doc.ts
export const getSalesBySellerDoc = {
  operation: {
    summary: 'Ventas por vendedor',
  },

  responses: {
    200: {
      status: 200,
      description: 'Ventas encontradas.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            seller_id: {
              type: 'string',
              example: 'c5d6e7f8-a9b0-1234-cdef-345678901234',
            },
            seller_name: { type: 'string', example: 'Luis Vega Mora' },
            total_sales: { type: 'number', example: 47 },
            total_amount: { type: 'number', example: 1284500 },
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
