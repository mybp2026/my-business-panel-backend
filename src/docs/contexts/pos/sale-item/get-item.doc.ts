// src/docs/contexts/pos/sale-item/get-item.doc.ts
export const getItemDoc = {
  operation: {
    summary: 'Get sale item by ID',
    description: 'Returns a single sale item by its ID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Sale item found.',
      schema: {
        type: 'object',
        properties: {
          item_id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          sale_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          product_id: { type: 'string', example: 'f2c7a94e-8b1d-4e3f-a5c6-0d9b2e7f3a18' },
          quantity: { type: 'number', example: 3 },
          unit_price: { type: 'number', example: 5000 },
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
