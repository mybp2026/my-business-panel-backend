// src/docs/contexts/inventory/warehouse/count-all-in-warehouse.doc.ts
export const countAllInWarehouseDoc = {
  dto: {
    warehouse_id: {
      description: 'UUID de la bodega a consultar.',
      example: 'b9d4e17c-3a82-4f5c-c0d7-1b6e9f3a2d85',
    },
  },

  operation: {
    summary: 'Conteo de productos en bodega',
  },

  responses: {
    201: {
      status: 201,
      description: 'Listado de productos con sus cantidades en la bodega.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            product_id: {
              type: 'string',
              example: 'f2c7a94e-8b1d-4e3f-a5c6-0d9b2e7f3a18',
            },
            product_name: { type: 'string', example: 'Café molido 250g' },
            amount: { type: 'number', example: 120 },
            expiration_date: { type: 'string', example: '2025-12-31' },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'No autorizado.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
    404: {
      status: 404,
      description: 'La bodega no existe.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Warehouse not found' },
        },
      },
    },
  },
};
