// src/docs/contexts/purchase/suppliers/delete-supplier.doc.ts
export const deleteSupplierDoc = {
  operation: {
    summary: 'Eliminar proveedor',
    description: 'Elimina un proveedor según su ID. Retorna 404 si el proveedor no existe.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Proveedor eliminado exitosamente.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Supplier deleted successfully' },
          supplier: {
            type: 'object',
            properties: {
              supplier_id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              supplier_name: { type: 'string', example: 'Distribuidora Nacional S.A.' },
            },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'No autorizado — token ausente o inválido.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
