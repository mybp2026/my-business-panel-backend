// src/docs/contexts/purchase/suppliers/update-supplier.doc.ts
export const updateSupplierDoc = {
  dto: {
    supplier_name: {
      description: 'Nuevo nombre del proveedor.',
      example: 'Distribuidora Nacional S.A.',
    },
    supplier_contact_info: {
      description: 'Información de contacto actualizada.',
      example: 'nuevo@distribuidora.com',
    },
    supplier_address: {
      description: 'Dirección actualizada del proveedor.',
      example: 'Avenida 10, Heredia',
    },
    supplier_notes: {
      description: 'Notas adicionales sobre el proveedor.',
      example: 'Cambió día de entrega a los viernes',
    },
  },

  operation: {
    summary: 'Actualizar proveedor',
    description:
      'Actualiza uno o más campos de un proveedor existente según su ID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Proveedor actualizado exitosamente.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Supplier updated successfully' },
          supplier: {
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
