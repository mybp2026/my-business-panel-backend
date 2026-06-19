// src/docs/contexts/purchase/suppliers/get-all-suppliers.doc.ts
export const getAllSuppliersDoc = {
  operation: {
    summary: 'Listar proveedores del tenant',
    description:
      'Retorna todos los proveedores registrados para el tenant del usuario autenticado.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Proveedores registrados para el tenant en sesión.',
      schema: {
        type: 'array',
        items: {
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
