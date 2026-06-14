export const getFixedVsVariableDoc = {
  operation: {
    summary: 'Resumen gastos fijos vs variables por período',
  },
  responses: {
    200: {
      status: 200,
      description: 'Totales de gastos fijos y variables del tenant en el rango indicado. Incluye gastos POS aprobados como variables.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            is_fixed: { type: 'boolean', example: true },
            expense_type: { type: 'string', example: 'Fijo' },
            total_amount: { type: 'string', example: '1250000.00' },
          },
        },
      },
    },
  },
};
