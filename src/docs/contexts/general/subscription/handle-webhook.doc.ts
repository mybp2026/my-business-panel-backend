// src/docs/contexts/general/subscription/handle-webhook.doc.ts
export const handleWebhookDoc = {
  operation: { summary: 'Handle Stripe webhook', description: 'Receives and processes Stripe webhook events for subscription lifecycle.' },
  responses: {
    200: { status: 200, description: 'Webhook processed successfully.', schema: { type: 'object', properties: { message: { type: 'string', example: 'Webhook received' } } } },
    400: { status: 400, description: 'Invalid webhook signature or payload.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Webhook Error' } } } },
  },
};
