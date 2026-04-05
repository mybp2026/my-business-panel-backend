export const getLoyalProgramByIdDoc = {
  operation: {
    summary: 'Obtener programa de lealtad por ID',
    description: 'Retorna el detalle de un programa de lealtad dado su ID. Lanza error si no existe.',
  },
  responses: {
    200: { status: 200, description: 'Detalle del programa de lealtad' },
    404: { status: 404, description: 'Programa de lealtad no encontrado' },
  },
};
