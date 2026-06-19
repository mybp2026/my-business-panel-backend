export const saveHaciendaConfigDoc = {
  dto: {
    tenant_id: {
      description: 'UUID del tenant',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    hacienda_username: {
      description: 'Usuario de Hacienda',
      example: 'usuario@empresa.com',
    },
    hacienda_password: {
      description: 'Contraseña de Hacienda',
      example: 'contrasena_segura',
    },
    hacienda_client_id: {
      description: 'Client ID de Hacienda',
      example: 'client-id-123',
    },
    p12_base64: {
      description: 'Certificado P12 en base64 (opcional)',
      example: 'base64encodedcert==',
    },
    p12_password: {
      description: 'Contraseña del certificado P12 (opcional)',
      example: 'cert_password',
    },
  },
  operation: {
    summary: 'Guardar configuración de Hacienda',
    description:
      'Crea o actualiza las credenciales de Hacienda para el tenant. Requiere nivel de acceso 4.',
  },
  responses: {
    201: { status: 201, description: 'Configuración guardada exitosamente' },
    400: { status: 400, description: 'Datos inválidos' },
    401: { status: 401, description: 'No autorizado' },
  },
};
