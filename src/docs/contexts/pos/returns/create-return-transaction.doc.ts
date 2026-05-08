export const createReturnTransactionDoc = {
  dto: {
    invoice_id: {
      description: 'UUID of the invoice associated with the return',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    tenant_customer_id: {
      description: 'UUID of the tenant customer requesting the return',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    total_refund_amount: {
      description: 'Total monetary amount to be refunded',
      example: 15000,
    },
    refund_method: {
      description: 'Numeric ID representing the refund method (e.g. 1=cash, 2=card)',
      example: 1,
    },
    return_status_id: {
      description: 'Numeric ID representing the return status',
      example: 1,
    },
    return_date: {
      description: 'Date of the return (ISO 8601)',
      example: '2025-01-15T00:00:00.000Z',
    },
    return_products: {
      description: 'List of products being returned, each with quantity, unit price, total price and sale_item_id',
      example: [
        {
          quantity: 2,
          unit_price: 5000,
          total_price: 10000,
          sale_item_id: '123e4567-e89b-12d3-a456-426614174000',
        },
      ],
    },
  },

  operation: {
    summary: 'Create a return transaction',
    description:
      'Creates a full return transaction. Adjusts the returned sale items quantities and updates the total amount of the original invoice. Runs inside a database transaction with automatic rollback on failure.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Return transaction created successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Return transaction created successfully',
          },
        },
      },
    },
    500: {
      status: 500,
      description: 'Internal server error — transaction was rolled back',
    },
    401: {
      status: 401,
      description: 'Unauthorized — missing or invalid authentication token',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
