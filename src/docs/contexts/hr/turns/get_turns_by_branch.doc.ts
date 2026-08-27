// src/docs/contexts/hr/turns/get_turns_by_branch.doc.ts
export const getTurnsByBranchDoc = {
  operation: {
    summary: 'Turnos por sucursal',
  },

  responses: {
    200: {
      status: 200,
      description: 'Turnos de la sucursal.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            turn_id: {
              type: 'string',
              example: 'e9f0a1b2-c3d4-5678-efab-678901234567',
            },
            branch_id: {
              type: 'string',
              example: 'd7e8f9a0-b1c2-3456-defa-567890123456',
            },
            entry: { type: 'string', example: '08:00' },
            out: { type: 'string', example: '17:00' },
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
