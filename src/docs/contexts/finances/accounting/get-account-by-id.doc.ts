// src/docs/contexts/finances/accounting/get-account-by-id.doc.ts
export const getAccountByIdDoc = {
  operation: {
    summary: 'Obtener cuenta contable por ID',
  },

  responses: {
    200: {
      status: 200,
      description: 'Detalle de la cuenta contable.',
      schema: {
        type: 'object',
        properties: {
          account_id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          name: { type: 'string', example: 'Caja General' },
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
      description: 'Cuenta contable no encontrada.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Account not found' },
        },
      },
    },
  },
};
