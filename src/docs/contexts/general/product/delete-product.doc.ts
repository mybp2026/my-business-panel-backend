// src/docs/contexts/general/product/delete-product.doc.ts
export const deleteProductDoc = {
  operation: {
    summary: 'Delete a product',
    description: 'Deletes a product variant by its UUID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Product deleted successfully.',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example:
              'Product with id 123e4567-e89b-12d3-a456-426614174000 deleted',
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized — Missing or invalid authentication token.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
