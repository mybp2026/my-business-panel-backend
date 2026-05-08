// src/docs/contexts/hr/incapacity/register-incapacity.doc.ts
export const registerIncapacityDoc = {
  dto: {
    employee_id: {
      description: 'UUID del empleado que presenta la incapacidad.',
      example: '2b3c4d5e-6f7a-8901-bcde-f12345678901',
    },
    branch_id: {
      description: 'UUID de la sucursal a la que pertenece el empleado.',
      example: 'd7e8f9a0-b1c2-3456-defa-567890123456',
    },
    type: {
      description: 'Tipo de incapacidad: CCSS para enfermedad común, INS para accidente laboral.',
      example: 'CCSS',
    },
    period_start: {
      description: 'Fecha de inicio de la incapacidad (YYYY-MM-DD).',
      example: '2024-02-05',
    },
    period_end: {
      description: 'Fecha de finalización de la incapacidad (YYYY-MM-DD).',
      example: '2024-02-12',
    },
    days_paying: {
      description: 'Cantidad de días que se le pagará al empleado durante la incapacidad.',
      example: 7,
    },
    percentage_to_pay: {
      description: 'Porcentaje del salario que se pagará durante la incapacidad (0-100).',
      example: 60,
    },
  },

  operation: {
    summary: 'Registrar incapacidad',
    description: 'CCSS o INS, según corresponda.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Incapacidad registrada.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Incapacity registered successfully' },
          incapacity_id: { type: 'string', example: 'b2c3d4e5-f6a7-8901-bcde-234567890123' },
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
