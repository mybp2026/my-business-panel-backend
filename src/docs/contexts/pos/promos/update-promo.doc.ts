export const updatePromoDoc = {
  dto: {
    promotion_name: { description: 'Nuevo nombre de la promoción', example: '3x2 en bebidas' },
    promotion_code: { description: 'Nuevo código único de la promoción', example: 'BEBIDAS3X2' },
    promotion_description: { description: 'Nueva descripción de la promoción', example: 'Lleva 3 bebidas por el precio de 2' },
    is_active: { description: 'Activar o desactivar la promoción', example: false },
    rules: { description: 'Reglas actualizadas de la promoción (todos los campos son opcionales)' },
  },
  operation: {
    summary: 'Actualizar promoción',
    description: 'Actualiza los datos de una promoción existente y opcionalmente sus reglas. Todos los campos son opcionales.',
  },
  responses: {
    200: { status: 200, description: 'Promoción actualizada exitosamente' },
    400: { status: 400, description: 'No hay campos válidos para actualizar' },
    500: { status: 500, description: 'Error al actualizar la promoción' },
  },
};
