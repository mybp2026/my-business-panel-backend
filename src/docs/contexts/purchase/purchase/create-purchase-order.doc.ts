export const createPurchaseOrderDoc = {
  dto: {
    supplier_id: {
      description: 'UUID del proveedor al que se le realiza la orden',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    warehouse_id: {
      description: 'UUID del almacén destino de los productos',
      example: '123e4567-e89b-12d3-a456-426614174001',
    },
    expected_delivery_date: {
      description: 'Fecha esperada de entrega (ISO 8601)',
      example: '2026-04-20',
    },
    items: {
      description: 'Lista de productos a ordenar con product_variant_id, quantity_ordered y unit_price',
    },
    has_invoice: {
      description: 'Indica si la orden viene acompañada de factura del proveedor (opcional)',
      example: true,
    },
    payment_condition: {
      description: 'Condición de pago: CREDIT o IN_FULL (opcional)',
      example: 'CREDIT',
    },
  },
  operation: {
    summary: 'Crear orden de compra',
    description: 'Crea una nueva orden de compra hacia un proveedor con los productos e items especificados. Requiere autenticación.',
  },
  responses: {
    201: { status: 201, description: 'Orden de compra creada exitosamente' },
    400: { status: 400, description: 'Datos inválidos' },
    401: { status: 401, description: 'No autorizado' },
  },
};
