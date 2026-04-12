// src/docs/contexts/general/document_type/delete.doc.ts
export const deleteDocumentTypeDoc = {
  operation: { summary: 'Delete a document type', description: 'Permanently deletes a document type by its ID.' },
  responses: {
    200: { status: 200, description: 'Document type deleted.', schema: { type: 'object', properties: { message: { type: 'string', example: 'Document type deleted' } } } },
    401: { status: 401, description: 'Unauthorized.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Unauthorized' } } } },
    404: { status: 404, description: 'Document type not found.', schema: { type: 'object', properties: { error: { type: 'string', example: 'Not found' } } } },
  },
};
