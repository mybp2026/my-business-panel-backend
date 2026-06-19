// src/docs/contexts/pos/loyal-program/get-loyal-programs-by-tenant.doc.ts
export const getLoyalProgramsByTenantDoc = {
  operation: {
    summary: 'Get loyalty programs by tenant',
    description: 'Returns all loyalty programs configured for a tenant.',
  },

  responses: {
    200: {
      status: 200,
      description: 'List of loyalty programs.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            loyal_program_id: {
              type: 'string',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
            tenant_id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            points_earned_per_currency_unit: { type: 'number', example: 1 },
            points_redeemed_per_currency_unit: { type: 'number', example: 0.5 },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
