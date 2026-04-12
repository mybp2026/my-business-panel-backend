// src/docs/contexts/inventory/warehouse/transfer-inventory.doc.ts
export const transferInventoryDoc = {
  operation: {
    summary: 'Transferir inventario entre bodegas',
  },

  responses: {
    201: {
      status: 201,
      description: 'Transferencia realizada exitosamente.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Inventory transferred successfully' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Stock insuficiente o datos inválidos.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Insufficient stock' },
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
      description: 'Bodega origen o destino no encontrada.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Warehouse not found' },
        },
      },
    },
  },
};
