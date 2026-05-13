export const posRoyaltyQueries = {
  listRulesByTenant: `
    SELECT
      r.royalty_rule_id,
      r.tenant_id,
      r.tenant_product_group_type_id,
      r.min_amount,
      r.created_at,
      r.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'royalty_option_id', o.royalty_option_id,
            'tenant_product_group_id', o.tenant_product_group_id,
            'group_name', g.group_name,
            'quantity', o.quantity,
            'scope', o.scope,
            'products', (
              SELECT COALESCE(json_agg(
                json_build_object(
                  'royalty_option_product_id', p.royalty_option_product_id,
                  'product_variant_id', p.product_variant_id,
                  'variant_name', pv.variant_name,
                  'sku', pv.sku
                )
              ), '[]'::json)
              FROM pos_schema.royalty_option_product p
              INNER JOIN general_schema.product_variant pv
                ON pv.product_variant_id = p.product_variant_id
              WHERE p.royalty_option_id = o.royalty_option_id
            )
          )
        ) FILTER (WHERE o.royalty_option_id IS NOT NULL),
        '[]'::json
      ) AS options
    FROM pos_schema.royalty_rule r
    LEFT JOIN pos_schema.royalty_option o ON o.royalty_rule_id = r.royalty_rule_id
    LEFT JOIN general_schema.tenant_product_group g ON g.tenant_product_group_id = o.tenant_product_group_id
    WHERE r.tenant_id = $1
      AND ($2::uuid IS NULL OR r.tenant_product_group_type_id = $2)
    GROUP BY r.royalty_rule_id, r.tenant_product_group_type_id
    ORDER BY r.min_amount ASC
  `,

  getRuleById: `
    SELECT
      r.royalty_rule_id,
      r.tenant_id,
      r.min_amount,
      r.created_at,
      r.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'royalty_option_id', o.royalty_option_id,
            'tenant_product_group_id', o.tenant_product_group_id,
            'group_name', g.group_name,
            'quantity', o.quantity,
            'scope', o.scope,
            'products', (
              SELECT COALESCE(json_agg(
                json_build_object(
                  'royalty_option_product_id', p.royalty_option_product_id,
                  'product_variant_id', p.product_variant_id,
                  'variant_name', pv.variant_name,
                  'sku', pv.sku
                )
              ), '[]'::json)
              FROM pos_schema.royalty_option_product p
              INNER JOIN general_schema.product_variant pv
                ON pv.product_variant_id = p.product_variant_id
              WHERE p.royalty_option_id = o.royalty_option_id
            )
          )
        ) FILTER (WHERE o.royalty_option_id IS NOT NULL),
        '[]'::json
      ) AS options
    FROM pos_schema.royalty_rule r
    LEFT JOIN pos_schema.royalty_option o ON o.royalty_rule_id = r.royalty_rule_id
    LEFT JOIN general_schema.tenant_product_group g ON g.tenant_product_group_id = o.tenant_product_group_id
    WHERE r.royalty_rule_id = $1
    GROUP BY r.royalty_rule_id
  `,

  createRule: `
    INSERT INTO pos_schema.royalty_rule (tenant_id, tenant_product_group_type_id, min_amount)
    VALUES ($1, $2, $3)
    RETURNING royalty_rule_id, tenant_id, tenant_product_group_type_id, min_amount, created_at, updated_at
  `,

  updateRule: `
    UPDATE pos_schema.royalty_rule
    SET min_amount = $2, updated_at = NOW()
    WHERE royalty_rule_id = $1
    RETURNING royalty_rule_id, tenant_id, min_amount, created_at, updated_at
  `,

  deleteRule: `
    DELETE FROM pos_schema.royalty_rule WHERE royalty_rule_id = $1
  `,

  createOption: `
    INSERT INTO pos_schema.royalty_option (royalty_rule_id, tenant_id, tenant_product_group_id, quantity, scope)
    SELECT $1, r.tenant_id, $2, $3, $4
    FROM pos_schema.royalty_rule r WHERE r.royalty_rule_id = $1
    RETURNING royalty_option_id, royalty_rule_id, tenant_product_group_id, quantity, scope, created_at
  `,

  updateOption: `
    UPDATE pos_schema.royalty_option
    SET quantity = $2, scope = $3
    WHERE royalty_option_id = $1
    RETURNING royalty_option_id, royalty_rule_id, tenant_product_group_id, quantity, scope, created_at
  `,

  deleteOption: `
    DELETE FROM pos_schema.royalty_option WHERE royalty_option_id = $1
  `,

  addOptionProduct: `
    INSERT INTO pos_schema.royalty_option_product (royalty_option_id, product_variant_id)
    VALUES ($1, $2)
    ON CONFLICT (royalty_option_id, product_variant_id) DO NOTHING
    RETURNING royalty_option_product_id, royalty_option_id, product_variant_id
  `,

  removeOptionProduct: `
    DELETE FROM pos_schema.royalty_option_product
    WHERE royalty_option_id = $1 AND product_variant_id = $2
  `,

  clearOptionProducts: `
    DELETE FROM pos_schema.royalty_option_product WHERE royalty_option_id = $1
  `,

  getApplicableRules: `
    SELECT
      r.royalty_rule_id,
      r.min_amount,
      FLOOR($2::numeric / r.min_amount)::int AS multiplier,
      COALESCE(
        json_agg(
          json_build_object(
            'royalty_option_id', o.royalty_option_id,
            'tenant_product_group_id', o.tenant_product_group_id,
            'group_name', g.group_name,
            'quantity', o.quantity,
            'scope', o.scope,
            'products', (
              SELECT COALESCE(json_agg(
                json_build_object(
                  'royalty_option_product_id', p.royalty_option_product_id,
                  'product_variant_id', p.product_variant_id,
                  'variant_name', pv.variant_name,
                  'sku', pv.sku,
                  'unit_price', pv.unit_price
                )
              ), '[]'::json)
              FROM pos_schema.royalty_option_product p
              INNER JOIN general_schema.product_variant pv
                ON pv.product_variant_id = p.product_variant_id
              WHERE p.royalty_option_id = o.royalty_option_id
            )
          )
        ) FILTER (WHERE o.royalty_option_id IS NOT NULL),
        '[]'::json
      ) AS options
    FROM pos_schema.royalty_rule r
    LEFT JOIN pos_schema.royalty_option o ON o.royalty_rule_id = r.royalty_rule_id
    LEFT JOIN general_schema.tenant_product_group g ON g.tenant_product_group_id = o.tenant_product_group_id
    WHERE r.tenant_id = $1
      AND r.min_amount <= $2
    GROUP BY r.royalty_rule_id
    ORDER BY r.min_amount ASC
  `,

  getOptionWithRule: `
    SELECT
      o.royalty_option_id,
      o.tenant_id,
      o.tenant_product_group_id,
      o.scope,
      r.royalty_rule_id,
      r.min_amount
    FROM pos_schema.royalty_option o
    INNER JOIN pos_schema.royalty_rule r ON r.royalty_rule_id = o.royalty_rule_id
    WHERE o.royalty_option_id = $1
  `,

  propagateToLowerRules: `
    INSERT INTO pos_schema.royalty_option_product (royalty_option_id, product_variant_id)
    SELECT o.royalty_option_id, v.product_variant_id
    FROM pos_schema.royalty_option o
    INNER JOIN pos_schema.royalty_rule r ON r.royalty_rule_id = o.royalty_rule_id
    CROSS JOIN unnest($4::uuid[]) AS v(product_variant_id)
    WHERE r.tenant_id = $1
      AND o.tenant_product_group_id = $2
      AND r.min_amount < $3
      AND o.scope = 'specific'
    ON CONFLICT (royalty_option_id, product_variant_id) DO NOTHING
  `,

  getGiftableProductsByGroup: `
    SELECT
      pv.product_variant_id,
      pv.variant_name,
      pv.sku,
      pv.unit_price,
      pv.giftable_from
    FROM general_schema.product_variant pv
    INNER JOIN general_schema.product_variant_group_assignment pvga
      ON pvga.product_variant_id = pv.product_variant_id
      AND pvga.tenant_id = pv.tenant_id
    WHERE pvga.tenant_product_group_id = $1
      AND pv.giftable = true
      AND pv.is_active = true
    ORDER BY pv.variant_name ASC
  `,
};
