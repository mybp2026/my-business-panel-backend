// src/docs/contexts/inventory/warehouse/add-product-to-warehouse.doc.ts
export const addProductToWarehouseDoc = {
  dto: {
    warehouse_id: {
      description: 'UUID de la bodega donde se ingresa el producto.',
      example: 'b9d4e17c-3a82-4f5c-c0d7-1b6e9f3a2d85',
    },
    product_id: {
      description: 'UUID del producto a ingresar.',
      example: 'f2c7a94e-8b1d-4e3f-a5c6-0d9b2e7f3a18',
    },
    amount: {
      description: 'Cantidad a ingresar. Debe ser mayor a cero.',
      example: 50,
    },
    expiration_date: {
      description: 'Fecha de vencimiento del producto. Opcional.',
      example: '2025-12-31',
    },
  },

  operation: {
    summary: 'Agregar producto a bodega',
  },

  responses: {
    201: {
      status: 201,
      description: 'Producto agregado al inventario de la bodega.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Product added to warehouse successfully' },
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
      description: 'La bodega o el producto no existen.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Warehouse not found' },
        },
      },
    },
  },
};
