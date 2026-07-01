// src/docs/contexts/pos/cash_register/close-session.doc.ts
export const closeCashRegisterSessionDoc = {
  dto: {
    cash_register_session_id: {
      description: 'UUID de la sesión de caja que se quiere cerrar.',
      example: 'c9e4b72a-1f83-4d5e-b6d2-0f5c9e3a7b14',
    },
    closing_amount: {
      description: 'Monto en efectivo al cierre de la sesión.',
      example: 75000,
    },
    closed_at: {
      description:
        'Fecha y hora del cierre. Opcional; si se omite, se usa el momento actual.',
      example: '2024-04-01T18:00:00.000Z',
    },
  },

  operation: {
    summary: 'Cerrar sesión de caja',
  },

  responses: {
    201: {
      status: 201,
      description: 'Sesión cerrada correctamente.',
      schema: {
        type: 'object',
        properties: {
          closed: {
            type: 'object',
            properties: {
              cash_register_session_id: {
                type: 'string',
                example: 'c9e4b72a-1f83-4d5e-b6d2-0f5c9e3a7b14',
              },
              closing_amount: { type: 'number', example: 75000 },
              closed_at: {
                type: 'string',
                example: '2024-04-01T18:00:00.000Z',
              },
              is_active: { type: 'boolean', example: false },
            },
          },
        },
      },
    },
    400: {
      status: 400,
      description: 'La sesión ya fue cerrada anteriormente.',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Cash register session is not active',
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
    404: {
      status: 404,
      description: 'La sesión indicada no existe.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Cash register session not found' },
        },
      },
    },
  },
};
