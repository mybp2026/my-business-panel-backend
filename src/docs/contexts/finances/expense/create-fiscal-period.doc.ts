// src/docs/contexts/finances/expense/create-fiscal-period.doc.ts
export const createFiscalPeriodDoc = {
  dto: {
    tenant_id: {
      description: 'UUID del tenant.',
      example: 'd3a97c14-2e5f-4b8d-9a1c-6f0e8b3d7c52',
    },
    name: {
      description: 'Nombre del período fiscal.',
      example: 'Q2 2024',
    },
    start_date: {
      description: 'Fecha de inicio del período.',
      example: '2024-04-01',
    },
    end_date: {
      description: 'Fecha de cierre del período.',
      example: '2024-06-30',
    },
  },

  operation: {
    summary: 'Crear período fiscal',
  },

  responses: {
    201: {
      status: 201,
      description: 'Período fiscal creado. Retorna el ID generado.',
      schema: {
        type: 'string',
        example: '2a6d4f91-c3b8-4e5a-d0e7-1f9b3c8a2d74',
      },
    },
  },
};
