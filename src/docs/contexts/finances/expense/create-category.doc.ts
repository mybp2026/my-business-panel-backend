// src/docs/contexts/finances/expense/create-category.doc.ts
export const createCategoryDoc = {
  dto: {
    tenant_id: {
      description: 'UUID del tenant al que pertenece la categoría.',
      example: 'd3a97c14-2e5f-4b8d-9a1c-6f0e8b3d7c52',
    },
    name: {
      description: 'Nombre de la categoría de gasto.',
      example: 'Servicios públicos',
    },
    account_code: {
      description: 'Código de la cuenta contable asociada.',
      example: '5100',
    },
    parent_category_id: {
      description: 'UUID de la categoría padre. Opcional.',
      example: '1a7e4c93-b2d8-4f6a-c0e5-9b3d1f8a2c74',
    },
    is_fixed: {
      description: 'Indica si el gasto es fijo o variable. Por defecto true.',
      example: true,
    },
  },

  operation: {
    summary: 'Crear categoría de gasto',
  },

  responses: {
    201: {
      status: 201,
      description: 'Categoría creada. Retorna el ID generado.',
      schema: {
        type: 'string',
        example: '4c9f3b82-a1e7-4d5c-b0d6-8e2f1a3c7b94',
      },
    },
  },
};
