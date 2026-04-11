// src/docs/contexts/inventory/warehouse/get-all-warehouses.doc.ts
export const getAllWarehousesDoc = {
  operation: {
    summary: 'Bodegas del tenant',
  },

  responses: {
    200: {
      status: 200,
      description: 'Bodegas registradas para el tenant en sesión.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            warehouse_id: { type: 'string', example: 'b9d4e17c-3a82-4f5c-c0d7-1b6e9f3a2d85' },
            branch_id: { type: 'string', example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94' },
            warehouse_name: { type: 'string', example: 'Bodega Central' },
            warehouse_address: { type: 'string', example: 'Zona Industrial, Cartago' },
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
      description: 'El tenant no existe.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Tenant not found' },
        },
      },
    },
  },
};
