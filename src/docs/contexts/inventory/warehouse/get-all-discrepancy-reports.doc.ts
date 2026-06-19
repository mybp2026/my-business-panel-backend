// src/docs/contexts/inventory/warehouse/get-all-discrepancy-reports.doc.ts
export const getAllDiscrepancyReportsDoc = {
  operation: {
    summary: 'Obtener reportes de discrepancia de una bodega',
  },

  responses: {
    200: {
      status: 200,
      description: 'Lista de reportes de discrepancia.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            report_id: {
              type: 'string',
              example: 'c3d4e5f6-7890-abcd-ef12-34567890abcd',
            },
            warehouse_id: {
              type: 'string',
              example: 'b9d4e17c-3a82-4f5c-c0d7-1b6e9f3a2d85',
            },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'No autorizado.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
