// src/docs/contexts/finances/expense/provision-categories.doc.ts
export const provisionCategoriesDoc = {
  operation: {
    summary: 'Provisionar categorías de gasto',
  },

  responses: {
    201: {
      status: 201,
      description: 'Categorías base creadas para el tenant.',
      schema: {
        type: 'number',
        example: 8,
      },
    },
  },
};
