// src/docs/contexts/general/product_category/delete-category.doc.ts
export const deleteProductCategoryDoc = {
  operation: { summary: 'Delete a product category', description: 'Permanently deletes a product category.' },
  responses: {
    200: { status: 200, description: 'Category deleted.', schema: { type: 'object', properties: { message: { type: 'string', example: 'Category deleted' } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
    404: { status: 404, description: 'Category not found.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Category not found' } } } },
  },
};
