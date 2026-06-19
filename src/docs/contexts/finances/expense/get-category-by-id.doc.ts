// src/docs/contexts/finances/expense/get-category-by-id.doc.ts
export const getCategoryByIdDoc = {
  operation: {
    summary: 'Categoría de gasto por ID',
  },

  responses: {
    200: {
      status: 200,
      description: 'Datos de la categoría de gasto.',
      schema: {
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
    404: {
      status: 404,
      description: 'Categoría no encontrada.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Categoría no encontrada' },
        },
      },
    },
  },
};
