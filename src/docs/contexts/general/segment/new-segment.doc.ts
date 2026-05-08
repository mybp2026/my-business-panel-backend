// src/docs/contexts/general/segment/new-segment.doc.ts
export const newSegmentDoc = {
  dto: {
    segment_name: { description: 'Name of the customer segment.', example: 'VIP' },
    segment_hierarchy: { description: 'Hierarchy level of the segment (higher = more exclusive).', example: 3 },
  },
  operation: { summary: 'Create a new customer segment', description: 'Creates a new customer segment.' },
  responses: {
    201: { status: 201, description: 'Segment created.', schema: { type: 'object', properties: { segment_id: { type: 'number', example: 1 }, segment_name: { type: 'string', example: 'VIP' } } } },
    400: { status: 400, description: 'Invalid data.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Bad Request' } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
  },
};
