// src/docs/contexts/purchase/suppliers/create-supplier.doc.ts
export const createSupplierDoc = {
  dto: {
    supplier_name: {
      description: 'Nombre del proveedor.',
      example: 'Distribuidora Nacional S.A.',
    },
    supplier_contact_info: {
      description: 'Información de contacto del proveedor (teléfono, correo, etc.).',
      example: 'contacto@distribuidora.com | +506-0000-0000',
    },
    supplier_address: {
      description: 'Dirección física del proveedor.',
      example: 'Calle 5, San José, Costa Rica',
    },
    supplier_notes: {
      description: 'Notas adicionales opcionales sobre el proveedor.',
      example: 'Entrega los martes y jueves',
    },
  },

  operation: {
    summary: 'Crear proveedor',
    description: 'Registra un nuevo proveedor para el tenant del usuario autenticado.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Proveedor creado exitosamente.',
      schema: {
        type: 'object',
        properties: {
          supplier_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          supplier_name: { type: 'string', example: 'Distribuidora Nacional S.A.' },
          supplier_contact_info: { type: 'string', example: 'contacto@distribuidora.com | +506-0000-0000' },
          supplier_address: { type: 'string', example: 'Calle 5, San José, Costa Rica' },
          supplier_notes: { type: 'string', example: 'Entrega los martes y jueves' },
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
