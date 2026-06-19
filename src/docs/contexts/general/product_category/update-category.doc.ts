// src/docs/contexts/general/product_category/update-category.doc.ts
export const updateProductCategoryDoc = {
  operation: {
    summary: 'Update a product category',
    description: 'Updates the name of an existing product category.',
  },
  responses: {
    200: {
      status: 200,
      description: 'Category updated.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Category updated' },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Unauthorized' } },
      },
    },
    404: {
      status: 404,
      description: 'Category not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Category not found' },
        },
      },
    },
  },
};
