export const newSegmentDoc = {
  dto: {
    segment_name: {
      description: 'Nombre único del segmento de clientes',
      example: 'VIP',
    },
    segment_hierarchy: {
      description: 'Nivel jerárquico del segmento (número mayor = mayor prioridad)',
      example: 1,
    },
  },
  operation: {
    summary: 'Crear nuevo segmento de clientes',
    description: 'Crea un nuevo segmento para clasificar clientes según criterios de negocio.',
  },
  responses: {
    201: { status: 201, description: 'Segmento creado exitosamente' },
    400: { status: 400, description: 'Datos inválidos o faltantes' },
  },
};
