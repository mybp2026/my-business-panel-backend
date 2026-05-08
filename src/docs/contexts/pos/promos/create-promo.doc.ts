export const createPromoDoc = {
  dto: {
    tenant_id: { description: 'UUID del tenant al que pertenece la promoción', example: '123e4567-e89b-12d3-a456-426614174000' },
    promotion_name: { description: 'Nombre descriptivo de la promoción', example: '2x1 en bebidas' },
    promotion_code: { description: 'Código único de la promoción', example: 'BEBIDAS2X1' },
    promotion_description: { description: 'Descripción opcional de la promoción', example: 'Lleva 2 bebidas por el precio de 1' },
    promotion_type_id: { description: 'ID del tipo de promoción del catálogo', example: 1 },
    customer_segment_id: { description: 'ID del segmento de clientes al que aplica', example: 2 },
    promotion_start_date: { description: 'Fecha de inicio de la promoción (ISO 8601)', example: '2026-04-01' },
    promotion_end_date: { description: 'Fecha de fin de la promoción (ISO 8601)', example: '2026-04-30' },
    is_active: { description: 'Indica si la promoción está activa', example: true },
    rules: { description: 'Reglas de la promoción (descuento, cantidad, tiers, etc.)' },
  },
  operation: {
    summary: 'Crear promoción con reglas',
    description: 'Crea una nueva promoción junto con sus reglas de aplicación. Requiere especificar tipo, segmento de clientes y reglas de descuento.',
  },
  responses: {
    201: { status: 201, description: 'Promoción y regla creadas exitosamente' },
    400: { status: 400, description: 'Datos inválidos o reglas vacías' },
    500: { status: 500, description: 'Error al crear la promoción o las reglas' },
  },
};
