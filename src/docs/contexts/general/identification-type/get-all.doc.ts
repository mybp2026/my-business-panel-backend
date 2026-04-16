// src/docs/contexts/general/identification-type/get-all.doc.ts
export const getAllDocumentTypesDoc = {
  operation: {
    summary: 'Get all document types',
    description: 'Returns all available document types.',
  },
  responses: {
    200: {
      status: 200,
      description: 'List of document types.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            document_type_id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'Cédula' },
          },
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
  },
};
