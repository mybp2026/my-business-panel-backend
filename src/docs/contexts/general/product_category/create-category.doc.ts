// src/docs/contexts/general/product_category/create-category.doc.ts
export const createProductCategoryDoc = {
  operation: { summary: 'Create a product category', description: 'Creates a new product category.' },
  responses: {
    201: { status: 201, description: 'Category created.', schema: { type: 'object', properties: { category_id: { type: 'string', example: 'uuid' }, name: { type: 'string', example: 'Electronics' } } } },
    400: { status: 400, description: 'Invalid data.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Bad Request' } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
  },
};
