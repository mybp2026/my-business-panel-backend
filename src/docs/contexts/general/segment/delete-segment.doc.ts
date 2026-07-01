// src/docs/contexts/general/segment/delete-segment.doc.ts
export const deleteSegmentDoc = {
  operation: {
    summary: 'Delete a customer segment',
    description: 'Permanently deletes a customer segment by its ID.',
  },
  responses: {
    200: {
      status: 200,
      description: 'Segment deleted.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Segment deleted successfully' },
        },
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
    404: {
      status: 404,
      description: 'Segment not found.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Segment not found' } },
      },
    },
  },
};
