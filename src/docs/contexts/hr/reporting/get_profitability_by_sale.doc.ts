// src/docs/contexts/hr/reporting/get_profitability_by_sale.doc.ts
export const getProfitabilityBySaleDoc = {
  operation: {
    summary: 'Rentabilidad por venta',
    description: 'Desglose de ingresos, costos y ganancia por cada venta.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Lista de ventas con su rentabilidad.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sale_id: { type: 'string', example: 'b3c4d5e6-f7a8-9012-bcde-f23456789012' },
            total_revenue: { type: 'number', example: 85000 },
            total_cost: { type: 'number', example: 52000 },
            profit: { type: 'number', example: 33000 },
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
