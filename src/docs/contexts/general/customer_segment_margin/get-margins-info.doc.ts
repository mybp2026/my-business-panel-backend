// src/docs/contexts/general/customer_segment_margin/get-margins-info.doc.ts
export const getMarginsInfoDoc = {
  operation: { summary: 'Get all segment margins', description: 'Returns all customer segment margin configurations.' },
  responses: {
    200: { status: 200, description: 'List of margins.', schema: { type: 'array', items: { type: 'object', properties: { margin_id: { type: 'string', example: 'uuid' } } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
  },
};
