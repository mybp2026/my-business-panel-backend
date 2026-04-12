// src/docs/contexts/hr/concept/update-concept.doc.ts
export const updateConceptDoc = {
  operation: {
    summary: 'Update a payroll concept',
    description: 'Updates the fields of an existing payroll concept by its ID.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Concept updated successfully.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Concept updated successfully' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid data.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
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
      description: 'Concept not found.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Concept not found' },
        },
      },
    },
  },
};
