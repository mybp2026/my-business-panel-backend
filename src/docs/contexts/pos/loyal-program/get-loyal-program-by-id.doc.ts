// src/docs/contexts/pos/loyal-program/get-loyal-program-by-id.doc.ts
export const getLoyalProgramByIdDoc = {
  operation: {
    summary: 'Get loyalty program by ID',
    description: 'Returns a single loyalty program by its ID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Loyalty program found.',
      schema: {
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
          minimum_purchase_for_points: { type: 'number', example: 1000 },
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
    404: {
      status: 404,
      description: 'Loyalty program not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Loyal program not found' },
        },
      },
    },
  },
};
