// src/docs/contexts/hr/concept/create-concept.doc.ts
export const createConceptDoc = {
  dto: {
    tenantId: {
      description: 'UUID of the tenant this concept belongs to.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    name: {
      description: 'Name of the payroll concept.',
      example: 'Bono de Transporte',
    },
    type: {
      description: 'Whether this concept is an earning or a deduction.',
      example: 'earning',
    },
    calcMethod: {
      description: 'Calculation method: fixed, percentage, formula, or manual.',
      example: 'fixed',
    },
    isTaxable: {
      description: 'Indicates whether this concept is subject to income tax.',
      example: false,
    },
    baseValue: {
      description: 'Base value used for the calculation.',
      example: 15000,
    },
    code: {
      description: 'Optional short code to identify the concept.',
      example: 'BT-001',
    },
  },

  operation: {
    summary: 'Create a payroll concept',
    description: 'Creates a new earning or deduction concept for a tenant\'s payroll.',
  },

  responses: {
    201: {
      status: 201,
      description: 'Concept created successfully.',
      schema: {
        type: 'object',
        properties: {
          concept_id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Bono de Transporte' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Invalid data.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
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
