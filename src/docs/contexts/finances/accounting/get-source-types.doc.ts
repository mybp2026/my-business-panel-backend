// src/docs/contexts/finances/accounting/get-source-types.doc.ts
export const getSourceTypesDoc = {
  operation: {
    summary: 'Obtener tipos de fuente contable',
  },

  responses: {
    200: {
      status: 200,
      description: 'Lista de tipos de fuente.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            source_type_id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Venta' },
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
