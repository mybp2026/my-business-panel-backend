// src/docs/contexts/finances/accounting/update-cost-center.doc.ts
export const updateCostCenterDoc = {
  operation: {
    summary: 'Actualizar centro de costo',
  },

  responses: {
    200: {
      status: 200,
      description: 'Centro de costo actualizado.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Cost center updated successfully' },
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
