// src/docs/contexts/hr/concept/soft-delete-concept.doc.ts
export const softDeleteConceptDoc = {
  operation: {
    summary: 'Soft-delete a payroll concept',
    description:
      'Marks a payroll concept as inactive without permanently removing it from the database.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Concept deactivated.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Concept deactivated' },
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
