// src/docs/contexts/finances/expense/create-expense.doc.ts
export const createExpenseDoc = {
  dto: {
    tenant_id: {
      description: 'UUID del tenant.',
      example: 'd3a97c14-2e5f-4b8d-9a1c-6f0e8b3d7c52',
    },
    branch_id: {
      description: 'UUID de la sucursal donde se genera el gasto.',
      example: '7e3f91bc-4a82-4d5c-b0e7-2c6d3f8a1b94',
    },
    category_id: {
      description: 'UUID de la categoría de gasto.',
      example: '4c9f3b82-a1e7-4d5c-b0d6-8e2f1a3c7b94',
    },
    description: {
      description: 'Descripción del gasto. Opcional.',
      example: 'Pago de electricidad mes de abril',
    },
    amount: {
      description: 'Monto antes de impuestos.',
      example: 45000,
    },
    tax_amount: {
      description: 'Monto de impuesto. Opcional.',
      example: 5850,
    },
    total_amount: {
      description: 'Total incluyendo impuestos.',
      example: 50850,
    },
    currency_id: {
      description: 'ID de la moneda.',
      example: 1,
    },
    expense_date: {
      description: 'Fecha en que se realizó el gasto.',
      example: '2024-04-01',
    },
    payment_method: {
      description: 'Método de pago. Por defecto CASH.',
      example: 'TRANSFER',
    },
    reference_number: {
      description: 'Número de referencia o comprobante. Opcional.',
      example: 'TRF-2024-0401',
    },
    notes: {
      description: 'Notas adicionales. Opcional.',
      example: 'Corresponde al período de marzo-abril',
    },
    created_by: {
      description: 'UUID del usuario que registra el gasto. Opcional.',
      example: 'f5a1c83e-7b2d-4e9f-b4c7-0d3a6e8f1c25',
    },
  },

  operation: {
    summary: 'Registrar gasto',
  },

  responses: {
    201: {
      status: 201,
      description: 'Gasto registrado. Si se generó asiento contable, se incluye el entryId.',
      schema: {
        type: 'object',
        properties: {
          expenseId: { type: 'string', example: '9e1b4c73-f2a8-4d5b-b0c7-3e6d9f1a2b84' },
          entryId: { type: 'string', example: '3b8f2c91-e4a7-4d5b-a0c6-7d1e9f3b2a85' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Error al registrar el gasto.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Error al registrar el gasto' },
        },
      },
    },
    404: {
      status: 404,
      description: 'La categoría de gasto no existe.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Categoría no encontrada' },
        },
      },
    },
  },
};
