// src/docs/contexts/hr/payroll_movements/get-by-paysheet.doc.ts
export const getMovementsByPaysheetDoc = {
  operation: {
    summary: 'Get payroll movements by paysheet',
    description:
      'Returns all payroll movements (earnings and deductions) associated with a specific paysheet.',
  },

  responses: {
    200: {
      status: 200,
      description: 'List of payroll movements.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            movement_id: { type: 'string', example: 'uuid' },
            concept_name: { type: 'string', example: 'Salario Base' },
            amount: { type: 'number', example: 800000 },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
