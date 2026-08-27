// src/docs/contexts/finances/expense/get-categories-by-tenant.doc.ts
export const getCategoriesByTenantDoc = {
  operation: {
    summary: 'Categorías de gastos del tenant',
  },

  responses: {
    200: {
      status: 200,
      description: 'Categorías de gasto registradas para el tenant.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category_id: {
              type: 'string',
              example: '4c9f3b82-a1e7-4d5c-b0d6-8e2f1a3c7b94',
            },
            name: { type: 'string', example: 'Servicios públicos' },
            account_code: { type: 'string', example: '5100' },
            is_fixed: { type: 'boolean', example: true },
            is_active: { type: 'boolean', example: true },
          },
        },
      },
    },
  },
};
