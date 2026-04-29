// src/docs/contexts/finances/expense/update-category.doc.ts
export const updateCategoryDoc = {
  dto: {
    name: {
      description: 'Nuevo nombre de la categoría.',
      example: 'Electricidad y agua',
    },
    account_code: {
      description: 'Código contable actualizado.',
      example: '5110',
    },
    is_fixed: {
      description: 'Cambia si el gasto es fijo o variable.',
      example: false,
    },
    is_active: {
      description: 'Activa o desactiva la categoría.',
      example: true,
    },
  },

  operation: {
    summary: 'Actualizar categoría de gasto',
  },

  responses: {
    200: {
      status: 200,
      description: 'Categoría actualizada. Retorna el ID.',
      schema: {
        type: 'string',
        example: '4c9f3b82-a1e7-4d5c-b0d6-8e2f1a3c7b94',
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
