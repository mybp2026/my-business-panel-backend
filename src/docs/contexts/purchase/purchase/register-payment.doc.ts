// src/docs/contexts/purchase/purchase/register-payment.doc.ts
export const registerPaymentDoc = {
  dto: {
    purchase_account_payable_id: {
      description: 'UUID de la cuenta por pagar a saldar.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    amount_paid: {
      description: 'Monto a pagar. Debe ser mayor a 0.',
      example: 500.0,
    },
    payment_method_id: {
      description: 'ID numérico del método de pago utilizado.',
      example: 1,
    },
    payment_reference: {
      description:
        'Referencia externa opcional del pago (ej. número de cheque, ID de transferencia).',
      example: 'TXN-20260409-001',
    },
  },

  operation: {
    summary: 'Registrar pago de compra',
    description:
      'Registra un pago contra una cuenta por pagar y genera el asiento contable correspondiente.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Pago registrado exitosamente.',
      schema: {
        type: 'object',
        properties: {
          payment_id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          purchase_account_payable: {
            type: 'object',
            properties: {
              purchase_account_payable_id: {
                type: 'string',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              amount_due: { type: 'number', example: 1000.0 },
              amount_paid: { type: 'number', example: 500.0 },
              status: { type: 'string', example: 'PARTIAL' },
            },
          },
        },
      },
    },
    400: {
      status: 400,
      description: 'Solicitud inválida — error al insertar el pago.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error al registrar el pago' },
          error: { type: 'string', example: 'Bad Request' },
          statusCode: { type: 'number', example: 400 },
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
