// src/docs/contexts/finances/accounting/create-account.doc.ts
export const createAccountDoc = {
  operation: {
    summary: 'Crear cuenta contable',
  },

  responses: {
    201: {
      status: 201,
      description: 'Cuenta contable creada.',
      schema: {
        type: 'object',
        properties: {
          account_id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
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
