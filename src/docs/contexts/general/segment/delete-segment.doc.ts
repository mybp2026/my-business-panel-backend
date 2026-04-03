export const deleteSegmentDoc = {
  operation: {
    summary: 'Eliminar segmento de clientes',
    description: 'Elimina un segmento del sistema usando su ID.',
  },
  params: {
    id: { description: 'ID numérico del segmento a eliminar', example: 1 },
  },
  responses: {
    200: { status: 200, description: 'Segmento eliminado exitosamente' },
    500: { status: 500, description: 'Error interno: el segmento no existe o no pudo ser eliminado' },
  },
};
