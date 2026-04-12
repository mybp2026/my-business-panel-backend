// src/docs/contexts/hr/suspention/update-suspention.doc.ts
export const updateSuspentionDoc = {
  dto: {
    suspentionStart: {
      description: 'Nueva fecha de inicio de la suspensión (opcional).',
      example: '2024-04-16',
    },
    suspentionEnd: {
      description: 'Nueva fecha de finalización de la suspensión (opcional).',
      example: '2024-04-18',
    },
    reason: {
      description: 'Motivo actualizado de la suspensión (opcional).',
      example: 'Falta grave confirmada tras investigación interna',
    },
  },

  operation: {
    summary: 'Actualizar suspensión',
    description:
      'Permite modificar los datos de una suspensión registrada. Solo se actualizan los campos enviados. Útil cuando cambian las fechas o se necesita corregir el motivo documentado.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Suspensión actualizada correctamente.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Suspention updated successfully' },
          id: { type: 'string', example: 'c4d5e6f7-a8b9-0123-defa-456789012345' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Datos inválidos en el cuerpo de la solicitud.',
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
