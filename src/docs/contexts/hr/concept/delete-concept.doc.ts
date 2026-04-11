// src/docs/contexts/hr/concept/delete-concept.doc.ts
export const deleteConceptDoc = {
  operation: {
    summary: 'Delete a payroll concept',
    description: 'Permanently removes a payroll concept from the database.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Concept deleted.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Concept deleted' },
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
