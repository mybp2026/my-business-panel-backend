export const deleteLoyalProgramDoc = {
  operation: {
    summary: 'Eliminar programa de lealtad',
    description: 'Elimina permanentemente un programa de lealtad dado su ID.',
  },
  responses: {
    200: { status: 200, description: 'Programa de lealtad eliminado exitosamente' },
    404: { status: 404, description: 'Programa de lealtad no encontrado' },
  },
};
