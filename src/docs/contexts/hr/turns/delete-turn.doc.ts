// src/docs/contexts/hr/turns/delete-turn.doc.ts
export const deleteTurnDoc = {
  operation: {
    summary: 'Eliminar turno',
  },

  responses: {
    200: {
      status: 200,
      description: 'Turno eliminado.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Turn deleted successfully' },
          turn_id: { type: 'string', example: 'e9f0a1b2-c3d4-5678-efab-678901234567' },
        },
      },
    },
    400: {
      status: 400,
      description: 'El ID del turno no es válido o el turno no existe.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
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
