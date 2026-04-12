// src/docs/contexts/pos/sale-item/delete-item.doc.ts
export const deleteItemDoc = {
  operation: {
    summary: 'Delete sale item',
    description: 'Removes an item from a sale by its ID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Item deleted.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Item deleted successfully' },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
    404: {
      status: 404,
      description: 'Item not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Item not found' },
        },
      },
    },
  },
};
