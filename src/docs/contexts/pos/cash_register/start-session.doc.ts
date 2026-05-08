// src/docs/contexts/pos/cash_register/start-session.doc.ts
export const startCashRegisterSessionDoc = {
  dto: {
    cash_register_id: {
      description: 'UUID de la caja registradora a abrir.',
      example: 'a4c82f17-9b3e-4d6a-8c5f-1e0b7d3a2c94',
    },
    opening_amount: {
      description: 'Monto con el que se abre la sesión de caja.',
      example: 50000,
    },
    opened_at: {
      description: 'Fecha y hora de apertura. Si no se envía, se toma el momento actual.',
      example: '2024-04-01T08:00:00.000Z',
    },
  },

  operation: {
    summary: 'Abrir sesión de caja',
  },

  responses: {
    201: {
      status: 201,
      description: 'Sesión iniciada correctamente.',
      schema: {
        type: 'object',
        properties: {
          started: {
            type: 'object',
            properties: {
              cash_register_session_id: { type: 'string', example: 'c9e4b72a-1f83-4d5e-b6d2-0f5c9e3a7b14' },
              cash_register_id: { type: 'string', example: 'a4c82f17-9b3e-4d6a-8c5f-1e0b7d3a2c94' },
              opening_amount: { type: 'number', example: 50000 },
              opened_at: { type: 'string', example: '2024-04-01T08:00:00.000Z' },
              is_active: { type: 'boolean', example: true },
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
    404: {
      status: 404,
      description: 'La caja registradora no fue encontrada.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Cash register not found' },
        },
      },
    },
  },
};
