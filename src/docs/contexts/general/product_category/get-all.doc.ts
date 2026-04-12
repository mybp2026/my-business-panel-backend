// src/docs/contexts/general/product_category/get-all.doc.ts
export const getAllCategoriesDoc = {
  operation: { summary: 'Get all product categories', description: 'Returns all product categories.' },
  responses: {
    200: { status: 200, description: 'List of categories.', schema: { type: 'array', items: { type: 'object', properties: { category_id: { type: 'string', example: 'uuid' }, name: { type: 'string', example: 'Electronics' } } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
  },
};
