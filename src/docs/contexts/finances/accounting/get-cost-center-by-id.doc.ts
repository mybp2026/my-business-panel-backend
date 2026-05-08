// src/docs/contexts/finances/accounting/get-cost-center-by-id.doc.ts
export const getCostCenterByIdDoc = {
  operation: {
    summary: 'Obtener centro de costo por ID',
  },

  responses: {
    200: {
      status: 200,
      description: 'Detalle del centro de costo.',
      schema: {
        type: 'object',
        properties: {
          cost_center_id: { type: 'string', example: 'b2c3d4e5-f678-90ab-cdef-1234567890ab' },
          name: { type: 'string', example: 'Ventas' },
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
    404: {
      status: 404,
      description: 'Centro de costo no encontrado.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Cost center not found' },
        },
      },
    },
  },
};
