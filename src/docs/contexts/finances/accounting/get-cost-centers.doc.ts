// src/docs/contexts/finances/accounting/get-cost-centers.doc.ts
export const getCostCentersDoc = {
  operation: {
    summary: 'Obtener centros de costo del tenant',
  },

  responses: {
    200: {
      status: 200,
      description: 'Lista de centros de costo.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            cost_center_id: { type: 'string', example: 'b2c3d4e5-f678-90ab-cdef-1234567890ab' },
            name: { type: 'string', example: 'Ventas' },
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
