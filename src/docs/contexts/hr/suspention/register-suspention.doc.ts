// src/docs/contexts/hr/suspention/register-suspention.doc.ts
export const registerNewSuspentionDoc = {
  dto: {
    employee_id: {
      description: 'UUID del empleado que será suspendido.',
      example: '3c4d5e6f-7a8b-9012-cdef-345678901234',
    },
    suspentionStart: {
      description: 'Fecha de inicio de la suspensión (YYYY-MM-DD).',
      example: '2024-04-15',
    },
    suspentionEnd: {
      description: 'Fecha de finalización de la suspensión (YYYY-MM-DD).',
      example: '2024-04-17',
    },
    reason: {
      description: 'Motivo de la suspensión disciplinaria.',
      example: 'Incumplimiento del reglamento interno de la empresa',
    },
    branchId: {
      description: 'UUID de la sucursal donde trabaja el empleado.',
      example: 'd7e8f9a0-b1c2-3456-defa-567890123456',
    },
  },

  operation: {
    summary: 'Registrar suspensión de empleado',
    description:
      'Registra una suspensión disciplinaria para un empleado. Los días de suspensión se aplican como descuento en la planilla del período correspondiente. El empleado queda inactivo durante ese rango de fechas.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Suspensión registrada correctamente.',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Suspention registered succesfully',
          },
          suspentionId: {
            type: 'string',
            example: 'c4d5e6f7-a8b9-0123-defa-456789012345',
          },
        },
      },
    },
    400: {
      status: 400,
      description: 'Datos inválidos o faltantes en el cuerpo de la solicitud.',
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
