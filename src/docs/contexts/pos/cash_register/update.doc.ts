// src/docs/contexts/pos/cash_register/update.doc.ts
export const updateCashRegisterDoc = {
  dto: {
    cash_register_id: {
      description: 'UUID de la caja registradora a actualizar.',
      example: 'a4c82f17-9b3e-4d6a-8c5f-1e0b7d3a2c94',
    },
    branch_id: {
      description: 'UUID de la sucursal a la que pertenece la caja.',
      example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94',
    },
    is_active: {
      description: 'Estado de la caja registradora.',
      example: false,
    },
  },

  operation: {
    summary: 'Actualizar caja registradora',
  },

  responses: {
    200: {
      status: 200,
      description: 'Caja actualizada.',
      schema: {
        type: 'object',
        properties: {
          updated: {
            type: 'object',
            properties: {
              cash_register_id: { type: 'string', example: 'a4c82f17-9b3e-4d6a-8c5f-1e0b7d3a2c94' },
              branch_id: { type: 'string', example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94' },
              is_active: { type: 'boolean', example: false },
            },
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
  },
};
