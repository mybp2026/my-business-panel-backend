// src/docs/contexts/purchase/suppliers/create-suppliers-bulk.doc.ts
export const createSuppliersBulkDoc = {
  operation: {
    summary: 'Crear proveedores en lote',
    description:
      'Crea multiples proveedores a la vez para el tenant del usuario autenticado.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Proveedores creados exitosamente.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'suppliers added successfully!' },
          count: { type: 'number', example: 3 },
          suppliers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                supplier_id: {
                  type: 'string',
                  example: '123e4567-e89b-12d3-a456-426614174000',
                },
                supplier_name: {
                  type: 'string',
                  example: 'Distribuidora Nacional S.A.',
                },
              },
            },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'No autorizado - token ausente o invalido.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
