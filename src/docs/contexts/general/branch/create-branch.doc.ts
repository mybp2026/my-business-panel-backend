export const createBranchDoc = {
  dto: {
    tenant_id: {
      description: 'UUID del tenant al que pertenece la sucursal. Debe coincidir con el tenant del usuario autenticado',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    branch_name: {
      description: 'Nombre de la sucursal',
      example: 'Sucursal Central',
    },
    branch_number: {
      description: 'Número o código identificador de la sucursal',
      example: '001',
    },
    address: {
      description: 'Dirección física de la sucursal (opcional)',
      example: 'Av. Central 123, San José',
    },
    contact_email: {
      description: 'Correo electrónico de contacto de la sucursal (opcional)',
      example: 'sucursal.central@empresa.com',
    },
    is_main_branch: {
      description: 'Indica si es la sucursal principal del tenant. Por defecto: true',
      example: true,
    },
  },
  operation: {
    summary: 'Crear nueva sucursal',
    description: 'Crea una nueva sucursal para el tenant del usuario autenticado. El tenant_id del body debe coincidir con el tenant de la sesión. Requiere autenticación y nivel de acceso 3 o superior.',
  },
  responses: {
    201: { status: 201, description: 'Sucursal creada exitosamente' },
    400: { status: 400, description: 'Datos inválidos o faltantes' },
    401: { status: 401, description: 'No autenticado o tenant_id no coincide con la sesión activa' },
    403: { status: 403, description: 'Nivel de acceso insuficiente. Se requiere nivel 3 o superior' },
  },
};
