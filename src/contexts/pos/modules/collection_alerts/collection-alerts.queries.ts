export const collectionAlertQueries = {
  getPendingByTenant: `
    SELECT *
    FROM pos_schema.get_pending_collection_alerts($1::uuid)
  `,

  getAccessById: `
    SELECT
      sca.collection_alert_id,
      ar.tenant_id
    FROM pos_schema.sale_collection_alert sca
    JOIN pos_schema.sale_account_receivable sar
      ON sar.sale_account_receivable_id = sca.sale_account_receivable_id
    JOIN general_schema.account_receivable ar
      ON ar.account_receivable_id = sar.account_receivable_id
    WHERE sca.collection_alert_id = $1
    LIMIT 1
  `,

  getConfigByTenant: `
    SELECT *
    FROM pos_schema.sale_collection_alert_config
    WHERE tenant_id = $1::uuid
    LIMIT 1
  `,

  upsertConfig: `
    SELECT pos_schema.initialize_collection_alert_config(
      $1, $2, $3, $4, $5
    ) AS collection_alert_config_id
  `,

  generate: `
    SELECT pos_schema.generate_collection_alerts()
  `,

  getStatsByTenant: `
    SELECT *
    FROM pos_schema.get_collection_alert_stats($1::uuid)
  `,

  resolve: `
    SELECT pos_schema.resolve_collection_alert($1::uuid)
  `,

  getTypes: `
    SELECT
      collection_alert_type_id,
      collection_alert_type_name,
      description
    FROM pos_schema.sale_collection_alert_type
    ORDER BY collection_alert_type_id ASC
  `,
};
