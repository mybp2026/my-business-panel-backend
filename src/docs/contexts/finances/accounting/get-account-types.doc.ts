// src/docs/contexts/finances/accounting/get-account-types.doc.ts
export const getAccountTypesDoc = {
  operation: {
    summary: 'Obtener tipos de cuenta contable',
  },

  responses: {
    200: {
      status: 200,
      description: 'Lista de tipos de cuenta.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            account_type_id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Activo' },
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
