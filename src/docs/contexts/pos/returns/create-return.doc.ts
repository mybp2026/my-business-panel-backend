export const createReturnDoc = {
  dto: {
    invoice_id: { description: 'UUID de la factura asociada a la devolución', example: '123e4567-e89b-12d3-a456-426614174000' },
    tenant_customer_id: { description: 'UUID del cliente del tenant que realiza la devolución', example: '123e4567-e89b-12d3-a456-426614174001' },
    total_refund_amount: { description: 'Monto total a reembolsar', example: 15000 },
    refund_method: { description: 'ID del método de reembolso', example: 1 },
    return_status_id: { description: 'ID del estado inicial de la devolución', example: 1 },
    return_date: { description: 'Fecha de la devolución (ISO 8601)', example: '2026-04-05' },
    return_products: { description: 'Lista de productos a devolver con cantidad, precio unitario y precio total' },
  },
  operation: {
    summary: 'Crear devolución completa',
    description: 'Registra una transacción de devolución, inserta los productos devueltos y actualiza los stock items y el total de la factura. Opera en una transacción atómica.',
  },
  responses: {
    201: { status: 201, description: 'Devolución creada exitosamente' },
    500: { status: 500, description: 'Error interno al procesar la devolución' },
  },
};
