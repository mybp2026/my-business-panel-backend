export const createSupplierDoc = {
  dto: {
    supplier_name: {
      description: 'Nombre del proveedor',
      example: 'Distribuidora Nacional S.A.',
    },
    supplier_contact_info: {
      description: 'Información de contacto del proveedor (teléfono, email, etc.)',
      example: 'Tel: 2222-3333 | contacto@distribuidora.com',
    },
    supplier_address: {
      description: 'Dirección física del proveedor',
      example: 'San José, Costa Rica, Barrio Los Yoses',
    },
    supplier_notes: {
      description: 'Notas adicionales sobre el proveedor (opcional)',
      example: 'Entrega los martes y jueves',
    },
  },
  operation: {
    summary: 'Crear proveedor',
    description: 'Crea un nuevo proveedor asociado al tenant del usuario autenticado. Requiere autenticación.',
  },
  responses: {
    201: { status: 201, description: 'Proveedor creado exitosamente' },
    400: { status: 400, description: 'Datos inválidos o sesión inválida' },
    401: { status: 401, description: 'No autorizado' },
  },
};
