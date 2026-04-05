export const deleteDInvoiceDoc = {
  operation: {
    summary: 'Eliminar factura digital',
    description: 'Elimina permanentemente una factura digital dado su ID.',
  },
  responses: {
    200: { status: 200, description: 'Factura eliminada exitosamente' },
    500: { status: 500, description: 'Error al eliminar la factura' },
  },
};
