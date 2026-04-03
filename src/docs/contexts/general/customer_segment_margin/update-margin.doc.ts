export const updateMarginDoc = {
  dto: {
    tenant_id: {
      description: 'UUID del tenant (opcional)',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    customer_segment_id: {
      description: 'ID del segmento de clientes (opcional)',
      example: 1,
    },
    customer_segment_margin_type: {
      description: 'Tipo de margen del segmento (opcional)',
      example: 2,
    },
    spending_threshold: {
      description: 'Umbral de gasto mínimo (opcional)',
      example: 75000,
    },
    seniority_months: {
      description: 'Meses de antigüedad mínimos requeridos (opcional)',
      example: 12,
    },
    frequency_per_month: {
      description: 'Frecuencia de compras mínima por mes (opcional)',
      example: 5,
    },
  },
  operation: {
    summary: 'Actualizar margen de segmento',
    description: 'Actualiza parcialmente los campos de un margen existente. Solo se actualizan los campos enviados.',
  },
  params: {
    id: { description: 'ID del margen a actualizar', example: '123e4567-e89b-12d3-a456-426614174000' },
  },
  responses: {
    200: { status: 200, description: 'Margen actualizado exitosamente' },
    400: { status: 400, description: 'No se enviaron campos válidos para actualizar' },
    500: { status: 500, description: 'Error al actualizar el margen en la base de datos' },
  },
};
