export const getDInvoiceByIdDoc = {
  operation: {
    summary: 'Obtener detalle de factura por ID',
    description: 'Retorna el detalle completo de una factura digital dado su ID. Lanza error si no existe.',
  },
  responses: {
    200: { status: 200, description: 'Detalle completo de la factura' },
    400: { status: 400, description: 'Factura no encontrada' },
  },
};
