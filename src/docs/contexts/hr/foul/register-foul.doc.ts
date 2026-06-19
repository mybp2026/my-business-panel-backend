// src/docs/contexts/hr/foul/register-foul.doc.ts
export const registerFoulDoc = {
  dto: {
    employee_id: {
      description: 'UUID del empleado al que se le registra la falta.',
      example: '2b3c4d5e-6f7a-8901-bcde-f12345678901',
    },
    branch_id: {
      description: 'UUID de la sucursal donde ocurrió la falta.',
      example: 'd7e8f9a0-b1c2-3456-defa-567890123456',
    },
    identificator: {
      description: 'Número de cédula del empleado para identificación rápida.',
      example: '3-0456-0891',
    },
    foul_date: {
      description: 'Fecha en que se registró la falta (YYYY-MM-DD).',
      example: '2024-03-18',
    },
    foul_hour: {
      description: 'Hora a la que se registró la falta.',
      example: '08:45',
    },
    description: {
      description: 'Descripción o motivo de la falta.',
      example: 'El empleado no se presentó a laborar sin previo aviso',
    },
  },

  operation: {
    summary: 'Registrar falta',
  },

  responses: {
    201: {
      status: 201,
      description: 'Falta registrada.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Foul registered successfully' },
          foul_id: {
            type: 'string',
            example: 'a0b1c2d3-e4f5-6789-abcd-012345678901',
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
