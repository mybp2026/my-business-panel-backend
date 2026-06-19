// src/docs/contexts/inventory/warehouse/get-discrepancy-report-by-id.doc.ts
export const getDiscrepancyReportByIdDoc = {
  operation: {
    summary: 'Obtener reporte de discrepancia por ID',
  },

  responses: {
    200: {
      status: 200,
      description: 'Detalle del reporte de discrepancia.',
      schema: {
        type: 'object',
        properties: {
          report_id: {
            type: 'string',
            example: 'c3d4e5f6-7890-abcd-ef12-34567890abcd',
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
    404: {
      status: 404,
      description: 'Reporte no encontrado.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Discrepancy report not found' },
        },
      },
    },
  },
};
