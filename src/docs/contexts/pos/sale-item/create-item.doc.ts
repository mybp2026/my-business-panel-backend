// src/docs/contexts/pos/sale-item/create-item.doc.ts
export const createItemDoc = {
  dto: {
    sale_id: {
      description: 'UUID de la venta a la que pertenecen los ítems.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    items: {
      description: 'Arreglo de ítems a insertar en la venta.',
      example: [{ product_id: 'uuid', quantity: 2, unit_price: 5000 }],
    },
  },

  operation: {
    summary: 'Create sale items',
    description: 'Bulk inserts items into a sale.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Items inserted.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Items created successfully' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid data.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
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
  },
};
