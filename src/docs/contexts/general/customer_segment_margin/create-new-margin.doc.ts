export const createNewMarginDoc = {
  dto: {
    tenant_id: {
      description: 'UUID del tenant al que pertenece el margen',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    customer_segment_id: {
      description: 'ID del segmento de clientes al que aplica este margen',
      example: 1,
    },
    customer_segment_margin_type: {
      description: 'Tipo de margen del segmento (ej: 1=Descuento, 2=Beneficio)',
      example: 1,
    },
    spending_threshold: {
      description: 'Umbral de gasto mínimo para aplicar el margen',
      example: 50000,
    },
    seniority_months: {
      description: 'Meses de antigüedad mínimos requeridos para aplicar el margen',
      example: 6,
    },
    frequency_per_month: {
      description: 'Frecuencia de compras mínima por mes para aplicar el margen',
      example: 3,
    },
  },
  operation: {
    summary: 'Crear nuevo margen de segmento',
    description: 'Crea un margen de beneficio o descuento asociado a un segmento de clientes de un tenant.',
  },
  responses: {
    201: { status: 201, description: 'Margen creado exitosamente' },
    400: { status: 400, description: 'Datos inválidos o faltantes' },
  },
};
