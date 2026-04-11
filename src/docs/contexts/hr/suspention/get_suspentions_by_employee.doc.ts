// src/docs/contexts/hr/suspention/get_suspentions_by_employee.doc.ts
export const getSuspentionByEmployeeDoc = {
  operation: {
    summary: 'Suspensiones de un empleado',
    description:
      'Devuelve el historial de suspensiones disciplinarias de un empleado. Incluye las activas y las ya finalizadas.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Suspensiones del empleado obtenidas correctamente.',
      schema: {
        type: 'object',
        properties: {
          suspention_id: { type: 'string', example: 'c4d5e6f7-a8b9-0123-defa-456789012345' },
          reason: { type: 'string', example: 'Incumplimiento del reglamento interno de la empresa' },
          suspention_start: { type: 'string', example: '2024-04-15' },
          suspention_end: { type: 'string', example: '2024-04-17' },
          is_active: { type: 'boolean', example: false },
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
