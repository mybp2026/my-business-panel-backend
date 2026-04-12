// src/docs/contexts/general/document_type/get-one.doc.ts
export const getOneDocumentTypeDoc = {
  operation: { summary: 'Get document type by ID', description: 'Returns a single document type by its ID.' },
  responses: {
    200: { status: 200, description: 'Document type found.', schema: { type: 'object', properties: { document_type_id: { type: 'string', example: 'uuid' }, name: { type: 'string', example: 'Cédula' } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
    404: { status: 404, description: 'Document type not found.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Not found' } } } },
  },
};
