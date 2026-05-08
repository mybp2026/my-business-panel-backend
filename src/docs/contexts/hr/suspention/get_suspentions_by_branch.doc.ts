// src/docs/contexts/hr/suspention/get_suspentions_by_branch.doc.ts
export const getSuspentionsByBranchDoc = {
  operation: {
    summary: 'Suspensiones por sucursal',
    description:
      'Retorna todas las suspensiones registradas en una sucursal, con el motivo y el rango de fechas de cada una. El encargado puede ver quiénes han sido suspendidos y cuándo.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Suspensiones de la sucursal obtenidas correctamente.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            suspention_id: { type: 'string', example: 'c4d5e6f7-a8b9-0123-defa-456789012345' },
            employee_id: { type: 'string', example: '3c4d5e6f-7a8b-9012-cdef-345678901234' },
            reason: { type: 'string', example: 'Falta grave — comportamiento inapropiado con un cliente' },
            suspention_start: { type: 'string', example: '2024-04-15' },
            suspention_end: { type: 'string', example: '2024-04-17' },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'No autorizado — token ausente o inválido.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
