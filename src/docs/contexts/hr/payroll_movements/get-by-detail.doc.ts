// src/docs/contexts/hr/payroll_movements/get-by-detail.doc.ts
export const getMovementsByDetailDoc = {
  operation: {
    summary: 'Get payroll movements by detail',
    description: 'Returns the payroll movements linked to a specific payroll detail line.',
  },

  responses: {
    200: {
      status: 200,
      description: 'List of movements for the given detail.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            movement_id: { type: 'string', example: 'uuid' },
            amount: { type: 'number', example: 15000 },
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
