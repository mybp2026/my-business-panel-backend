// src/docs/contexts/finances/accounting/update-account.doc.ts
export const updateAccountDoc = {
  operation: {
    summary: 'Actualizar cuenta contable',
  },

  responses: {
    200: {
      status: 200,
      description: 'Cuenta contable actualizada.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Account updated successfully' },
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
      description: 'Cuenta no encontrada.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Account not found' },
        },
      },
    },
  },
};
