export const findReturnsDoc = {
  operation: {
    summary: 'Find return transactions',
    description:
      'Returns a list of return transactions filtered by optional query parameters. All filters are optional and can be combined.',
  },

  responses: {
    200: {
      status: 200,
      description: 'List of return transactions matching the filters',
      schema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized — missing or invalid authentication token',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
