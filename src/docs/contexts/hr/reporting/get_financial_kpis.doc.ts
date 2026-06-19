// src/docs/contexts/hr/reporting/get_financial_kpis.doc.ts
export const getFinancialKpisDoc = {
  operation: {
    summary: 'KPIs financieros',
    description:
      'Indicadores clave del período: márgenes, gastos y crecimiento.',
  },

  responses: {
    200: {
      status: 200,
      description: 'KPIs del período.',
      schema: {
        type: 'object',
        properties: {
          gross_margin: { type: 'number', example: 42.5 },
          net_margin: { type: 'number', example: 18.7 },
          operating_expenses_ratio: { type: 'number', example: 23.8 },
          revenue_growth: { type: 'number', example: 6.2 },
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
