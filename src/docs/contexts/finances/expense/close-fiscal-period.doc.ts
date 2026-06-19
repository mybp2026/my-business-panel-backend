// src/docs/contexts/finances/expense/close-fiscal-period.doc.ts
export const closeFiscalPeriodDoc = {
  operation: {
    summary: 'Cerrar período fiscal',
  },

  responses: {
    200: {
      status: 200,
      description: 'Período cerrado. Retorna el ID del período.',
      schema: {
        type: 'string',
        example: '2a6d4f91-c3b8-4e5a-d0e7-1f9b3c8a2d74',
      },
    },
    400: {
      status: 400,
      description: 'El período no existe o ya estaba cerrado.',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Período no encontrado o ya está cerrado',
          },
        },
      },
    },
  },
};
