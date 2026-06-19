// src/docs/contexts/general/customer_segment_margin/create-margin.doc.ts
export const createMarginDoc = {
  dto: {
    tenant_id: {
      description: 'UUID of the tenant.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    customer_segment_id: {
      description: 'ID of the customer segment.',
      example: 1,
    },
    customer_segment_margin_type: {
      description: 'Type of margin (numeric ID).',
      example: 2,
    },
    spending_threshold: {
      description: 'Minimum spending amount to qualify.',
      example: 10000,
    },
    seniority_months: {
      description: 'Minimum seniority in months.',
      example: 6,
    },
    frequency_per_month: {
      description: 'Required purchase frequency per month.',
      example: 4,
    },
  },
  operation: {
    summary: 'Create a segment margin',
    description: 'Creates a new customer segment margin configuration.',
  },
  responses: {
    201: {
      status: 201,
      description: 'Margin created.',
      schema: {
        type: 'object',
        properties: { margin_id: { type: 'string', example: 'uuid' } },
      },
    },
    400: {
      status: 400,
      description: 'Invalid data.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Bad Request' } },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Unauthorized' } },
      },
    },
  },
};
