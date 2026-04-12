// src/docs/contexts/inventory/warehouse/create-warehouse.doc.ts
export const createWarehouseDoc = {
  dto: {
    branch_id: {
      description: 'UUID de la sucursal donde estará ubicada la bodega.',
      example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94',
    },
    warehouse_name: {
      description: 'Nombre de la bodega.',
      example: 'Bodega Central',
    },
    warehouse_address: {
      description: 'Dirección física de la bodega.',
      example: 'Zona Industrial, Cartago',
    },
  },

  operation: {
    summary: 'Crear bodega',
  },

  responses: {
    201: {
      status: 201,
      description: 'Bodega creada.',
      schema: {
        type: 'object',
        properties: {
          warehouse_id: { type: 'string', example: 'b9d4e17c-3a82-4f5c-c0d7-1b6e9f3a2d85' },
          branch_id: { type: 'string', example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94' },
          warehouse_name: { type: 'string', example: 'Bodega Central' },
          warehouse_address: { type: 'string', example: 'Zona Industrial, Cartago' },
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
      description: 'El tenant o la sucursal no existen.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Branch not found for this tenant' },
        },
      },
    },
  },
};
