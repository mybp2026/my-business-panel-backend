// src/docs/contexts/finances/accounting/provision-accounts.doc.ts
export const provisionAccountsDoc = {
  operation: {
    summary: 'Aprovisionar cuentas contables por defecto para el tenant',
  },

  responses: {
    201: {
      status: 201,
      description: 'Cuentas aprovisionadas exitosamente.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Accounts provisioned successfully' },
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
