// src/docs/contexts/finances/accounting/create-cost-center.doc.ts
export const createCostCenterDoc = {
  operation: {
    summary: 'Crear centro de costo',
  },

  responses: {
    201: {
      status: 201,
      description: 'Centro de costo creado.',
      schema: {
        type: 'object',
        properties: {
          cost_center_id: { type: 'string', example: 'b2c3d4e5-f678-90ab-cdef-1234567890ab' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Datos inválidos.',
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
