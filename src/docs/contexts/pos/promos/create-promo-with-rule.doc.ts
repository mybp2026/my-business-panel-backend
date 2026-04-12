// src/docs/contexts/pos/promos/create-promo-with-rule.doc.ts
export const createPromoWithRuleDoc = {
  dto: {
    tenant_id: {
      description: 'UUID del tenant al que pertenece la promoción.',
      example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    },
    promotion_name: {
      description: 'Nombre de la promoción.',
      example: '2x1 en bebidas',
    },
    promotion_code: {
      description: 'Código único para identificar la promoción.',
      example: 'BEBE2X1',
    },
    promotion_description: {
      description: 'Descripción opcional de la promoción.',
      example: 'Por cada bebida comprada llevas otra gratis',
    },
    promotion_type_id: {
      description: 'ID del tipo de promoción.',
      example: 2,
    },
    customer_segment_id: {
      description: 'ID del segmento de clientes al que aplica.',
      example: 1,
    },
    promotion_start_date: {
      description: 'Fecha de inicio de la promoción.',
      example: '2024-04-01',
    },
    promotion_end_date: {
      description: 'Fecha de fin de la promoción.',
      example: '2024-04-30',
    },
    is_active: {
      description: 'Si la promoción estará activa al momento de crearla.',
      example: true,
    },
    rules: {
      description: 'Reglas de la promoción según su tipo (descuento, cantidad mínima, etc.).',
      example: {
        buy_quantity: 1,
        get_quantity: 1,
        get_discount_percentage: 100,
      },
    },
  },

  operation: {
    summary: 'Crear promoción con reglas',
  },

  responses: {
    201: {
      status: 201,
      description: 'Promoción y regla creadas.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Promotion and rule with id: abc123 created successfully' },
        },
      },
    },
    400: {
      status: 400,
      description: 'Las reglas enviadas no contienen campos válidos.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    },
    500: {
      status: 500,
      description: 'Error al insertar la promoción en la base de datos.',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Error creating promotion' },
        },
      },
    },
  },
};
