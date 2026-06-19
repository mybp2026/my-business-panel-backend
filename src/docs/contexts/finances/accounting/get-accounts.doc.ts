// src/docs/contexts/finances/accounting/get-accounts.doc.ts
export const getAccountsDoc = {
  operation: {
    summary: 'Obtener cuentas contables del tenant',
  },

  responses: {
    200: {
      status: 200,
      description: 'Lista de cuentas contables.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            account_id: {
              type: 'string',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
            name: { type: 'string', example: 'Caja General' },
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
