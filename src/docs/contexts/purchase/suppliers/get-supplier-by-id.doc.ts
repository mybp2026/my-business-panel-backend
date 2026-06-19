// src/docs/contexts/purchase/suppliers/get-supplier-by-id.doc.ts
export const getSupplierByIdDoc = {
  operation: {
    summary: 'Obtener proveedor por ID',
    description: 'Retorna un proveedor según su UUID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Datos del proveedor.',
      schema: {
        type: 'object',
        properties: {
          supplier_id: {
            type: 'string',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
          supplier_name: {
            type: 'string',
            example: 'Distribuidora Nacional S.A.',
          },
          supplier_contact_info: {
            type: 'string',
            example: 'contacto@distribuidora.com',
          },
          supplier_address: {
            type: 'string',
            example: 'Calle 5, San José, Costa Rica',
          },
          supplier_notes: {
            type: 'string',
            example: 'Entrega los martes y jueves',
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
