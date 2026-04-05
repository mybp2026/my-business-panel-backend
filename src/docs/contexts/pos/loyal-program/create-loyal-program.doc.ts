export const createLoyalProgramDoc = {
  dto: {
    tenant_id: { description: 'UUID del tenant al que pertenece el programa', example: '123e4567-e89b-12d3-a456-426614174000' },
    points_earned_per_currency_unit: { description: 'Puntos ganados por cada unidad de moneda gastada', example: 10 },
    points_redeemed_per_currency_unit: { description: 'Puntos necesarios para redimir una unidad de moneda', example: 100 },
    minimum_purchase_for_points: { description: 'Monto mínimo de compra para ganar puntos (opcional, default 0)', example: 5000 },
  },
  operation: {
    summary: 'Crear programa de lealtad',
    description: 'Crea un nuevo programa de lealtad para un tenant, configurando la tasa de acumulación y redención de puntos.',
  },
  responses: {
    201: { status: 201, description: 'Programa de lealtad creado exitosamente' },
    400: { status: 400, description: 'Datos inválidos' },
  },
};
