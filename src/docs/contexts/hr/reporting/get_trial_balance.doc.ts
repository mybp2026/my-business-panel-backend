// src/docs/contexts/hr/reporting/get_trial_balance.doc.ts
export const getTrialBalanceDoc = {
  operation: {
    summary: 'Balance de comprobación',
    description: 'Devuelve el balance de comprobación con cuentas, débitos y créditos.',
  },
  responses: {
    200: {
      status: 200,
      description: 'Balance de comprobación.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            account_code: { type: 'string', example: '1101' },
            account_name: { type: 'string', example: 'Caja general' },
            debit: { type: 'number', example: 850000 },
            credit: { type: 'number', example: 620000 },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'No autorizado — token ausente o inválido.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
