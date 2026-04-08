// src/docs/contexts/hr/suspention/close-suspention.doc.ts
export const closeSuspentionDoc = {
  operation: {
    summary: 'Cerrar suspensión',
    description:
      'Cierra una suspensión activa, reactivando al empleado en el sistema. A partir de este momento el empleado vuelve a su estado activo y puede ser incluido en planilla normalmente.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Suspensión cerrada correctamente.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Suspention closed succesfully' },
          suspentionId: { type: 'string', example: 'c4d5e6f7-a8b9-0123-defa-456789012345' },
        },
      },
    },
    400: {
      status: 400,
      description: 'El ID de la suspensión no es válido o ya está cerrada.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
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
