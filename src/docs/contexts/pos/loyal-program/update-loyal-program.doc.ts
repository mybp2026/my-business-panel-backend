export const updateLoyalProgramDoc = {
  dto: {
    minimum_purchase_for_points: { description: 'Nuevo monto mínimo de compra para ganar puntos', example: 7500 },
  },
  operation: {
    summary: 'Actualizar programa de lealtad',
    description: 'Actualiza la configuración de un programa de lealtad existente dado su ID.',
  },
  responses: {
    200: { status: 200, description: 'Programa de lealtad actualizado exitosamente' },
    404: { status: 404, description: 'Programa de lealtad no encontrado' },
  },
};
