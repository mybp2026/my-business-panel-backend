// src/docs/contexts/general/customer_segment_margin/delete-margin.doc.ts
export const deleteMarginDoc = {
  operation: { summary: 'Delete a segment margin', description: 'Permanently deletes a customer segment margin.' },
  responses: {
    200: { status: 200, description: 'Margin deleted.', schema: { type: 'object', properties: { message: { type: 'string', example: 'Margin deleted' } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
    404: { status: 404, description: 'Margin not found.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Margin not found' } } } },
  },
};
