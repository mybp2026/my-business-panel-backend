// src/docs/contexts/general/customer_segment_margin/update-margin.doc.ts
export const updateMarginDoc = {
  operation: {
    summary: 'Update a segment margin',
    description: 'Updates an existing customer segment margin configuration.',
  },
  responses: {
    200: {
      status: 200,
      description: 'Margin updated.',
      schema: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Margin updated' } },
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
    404: {
      status: 404,
      description: 'Margin not found.',
      schema: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Margin not found' } },
      },
    },
  },
};
