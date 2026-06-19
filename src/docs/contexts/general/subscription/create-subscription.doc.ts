// src/docs/contexts/general/subscription/create-subscription.doc.ts
export const createSubscriptionDoc = {
  dto: {
    tenant_id: {
      description: 'UUID of the tenant subscribing.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    payment_method_id: { description: 'ID of the payment method.', example: 1 },
    payment_amount: {
      description: 'Amount to charge for the subscription.',
      example: 29.99,
    },
    details: {
      description: 'Details or notes about the subscription.',
      example: 'Monthly plan - Pro tier',
    },
    plan: { description: 'Plan name or code.', example: 'pro' },
    subscription_type_id: {
      description: 'ID of the subscription type.',
      example: 2,
    },
    start_date: {
      description: 'Subscription start date (ISO 8601).',
      example: '2024-01-01',
    },
    end_date: {
      description: 'Subscription end date (ISO 8601).',
      example: '2024-12-31',
    },
  },
  operation: {
    summary: 'Create a new subscription',
    description: 'Creates a Stripe subscription for a tenant.',
  },
  responses: {
    201: {
      status: 201,
      description: 'Subscription created.',
      schema: {
        type: 'object',
        properties: {
          subscription_id: { type: 'string', example: 'sub_abc123' },
        },
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
