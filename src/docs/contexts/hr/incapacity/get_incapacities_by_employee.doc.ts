// src/docs/contexts/hr/incapacity/get_incapacities_by_employee.doc.ts
export const getIncapacitiesByEmployeeDoc = {
  operation: {
    summary: 'Incapacidades de un empleado',
    description: 'Incluye activas y cerradas.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Historial de incapacidades.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            incapacity_id: { type: 'string', example: 'b2c3d4e5-f6a7-8901-bcde-234567890123' },
            employee_id: { type: 'string', example: '2b3c4d5e-6f7a-8901-bcde-f12345678901' },
            type: { type: 'string', example: 'INS' },
            period_start: { type: 'string', example: '2024-01-20' },
            period_end: { type: 'string', example: '2024-02-03' },
            days_paying: { type: 'number', example: 14 },
            percentage_to_pay: { type: 'number', example: 100 },
            is_active: { type: 'boolean', example: false },
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
