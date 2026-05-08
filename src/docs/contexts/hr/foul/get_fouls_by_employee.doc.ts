// src/docs/contexts/hr/foul/get_fouls_by_employee.doc.ts
export const getFoulsByEmployeeDoc = {
  operation: {
    summary: 'Faltas de un empleado',
  },

  responses: {
    200: {
      status: 200,
      description: 'Faltas del empleado.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            foul_id: { type: 'string', example: 'a0b1c2d3-e4f5-6789-abcd-012345678901' },
            foul_date: { type: 'string', example: '2024-03-18' },
            foul_hour: { type: 'string', example: '08:45' },
            description: { type: 'string', example: 'El empleado no se presentó a laborar sin previo aviso' },
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
