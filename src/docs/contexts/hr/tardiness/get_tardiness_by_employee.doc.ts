// src/docs/contexts/hr/tardiness/get_tardiness_by_employee.doc.ts
export const getTardinessByEmployeeDoc = {
  operation: {
    summary: 'Tardanzas de un empleado',
  },

  responses: {
    200: {
      status: 200,
      description: 'Historial de tardanzas del empleado.',
      schema: {
        type: 'object',
        properties: {
          // falta documentar totalCount aquí
          tardiness: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tardiness_id: { type: 'string', example: 'f1a2b3c4-d5e6-7890-fabc-789012345678' },
                employee_id: { type: 'string', example: '1a2b3c4d-5e6f-7890-abcd-ef1234567890' },
                type: { type: 'string', example: 'LATE_ENTRY' },
                log: { type: 'string', example: '08:23' },
                registered_at: { type: 'string', example: '2024-03-15T08:23:00.000Z' },
              },
            },
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
