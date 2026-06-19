// src/docs/contexts/hr/concept/provision-concepts.doc.ts
export const provisionConceptsDoc = {
  operation: {
    summary: 'Provision default payroll concepts for the current tenant',
    description:
      'Copia los conceptos de nomina predeterminados (plantilla) al tenant autenticado. Idempotente: si el tenant ya tiene conceptos, no crea nada. El tenant se toma de la sesion, no del body.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Conceptos predeterminados provisionados (o ya existentes).',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '9 conceptos predeterminados creados correctamente',
          },
          created: { type: 'number', example: 9 },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
