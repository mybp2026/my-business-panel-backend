// src/docs/contexts/pos/cash_register/create.doc.ts
export const createCashRegisterDoc = {
  dto: {
    branch_id: {
      description: 'UUID de la sucursal donde se registra la caja.',
      example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94',
    },
    register_name: {
      description: 'Nombre identificador de la caja registradora.',
      example: 'Caja Principal',
    },
    is_active: {
      description:
        'Indica si la caja estará activa al momento de crearla. Por defecto es true.',
      example: true,
    },
  },

  operation: {
    summary: 'Crear caja registradora',
  },

  responses: {
    201: {
      status: 201,
      description: 'Caja registradora creada.',
      schema: {
        type: 'object',
        properties: {
          created: {
            type: 'object',
            properties: {
              cash_register_id: {
                type: 'string',
                example: 'a4c82f17-9b3e-4d6a-8c5f-1e0b7d3a2c94',
              },
              branch_id: {
                type: 'string',
                example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94',
              },
              register_name: { type: 'string', example: 'Caja Principal' },
              is_active: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
    400: {
      status: 400,
      description: 'La sucursal indicada no existe o los datos son inválidos.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
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
