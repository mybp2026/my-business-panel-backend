// src/docs/contexts/general/segment/get-segments.doc.ts
export const getSegmentsDoc = {
  operation: { summary: 'Get all segments', description: 'Returns all customer segments.' },
  responses: {
    200: { status: 200, description: 'List of segments.', schema: { type: 'array', items: { type: 'object', properties: { segment_id: { type: 'number', example: 1 }, segment_name: { type: 'string', example: 'VIP' } } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
  },
};
