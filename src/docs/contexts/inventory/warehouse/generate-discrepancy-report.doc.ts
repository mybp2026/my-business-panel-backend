// src/docs/contexts/inventory/warehouse/generate-discrepancy-report.doc.ts
export const generateDiscrepancyReportDoc = {
  operation: {
    summary: 'Generar reporte de discrepancia',
  },

  responses: {
    201: {
      status: 201,
      description: 'Reporte de discrepancia generado exitosamente.',
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
      description: 'Bodega o producto no encontrado.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Warehouse not found' },
        },
      },
    },
  },
};
