// src/docs/contexts/inventory/warehouse/delete-warehouse.doc.ts
export const deleteWarehouseDoc = {
  operation: {
    summary: 'Eliminar bodega',
  },

  responses: {
    200: {
      status: 200,
      description: 'Bodega eliminada.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Warehouse deleted successfully' },
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
      description: 'La bodega no existe para el tenant en sesión.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Warehouse not found for this tenant' },
        },
      },
    },
  },
};
