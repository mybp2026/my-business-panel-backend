import { createQueries } from '@crane-technologies/database';

export const generalQueryDefs = {
  users: {
    all: 'SELECT user_id, email, role_id, tenant_id FROM general_schema.users',
    byId: 'SELECT user_id, email, role_id, tenant_id, created_at, updated_at FROM general_schema.users WHERE user_id = $1 LIMIT 1',
    byIdFull: `
      SELECT
        u.user_id, u.email, u.role_id, u.tenant_id, u.created_at, u.updated_at,
        e.employee_id, e.first_name, e.last_name, e.doc_number, e.phone,
        e.email AS employee_email, e.is_active, e.payment_schedule_id, e.branch_id,
        c.contract_id, c.start_date::text AS start_date, c.end_date::text AS end_date,
        c.hours, c.base_salary, c.duties, c.turn_type, c.turn_id
      FROM general_schema.users u
      LEFT JOIN hr_schema.employee e ON e.user_id = u.user_id
      LEFT JOIN hr_schema.contract c ON c.contract_id = e.contract_id
      WHERE u.user_id = $1 LIMIT 1
    `,

    byEmail:
      'SELECT user_id, email, role_id FROM general_schema.users WHERE email = $1 LIMIT 1',
    byTenant:
      'SELECT user_id, email, role_id, created_at FROM general_schema.users WHERE tenant_id = $1',
    byEmailWithPassword:
      'SELECT * FROM general_schema.users WHERE email = $1 LIMIT 1',
    create: `
      INSERT INTO general_schema.users 
      (tenant_id, email, password_hash, role_id, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, NOW(), NOW()) 
      RETURNING *
    `,
    update: `
      UPDATE general_schema.users
      SET
        email = COALESCE($1, email),
        role_id = COALESCE($2, role_id),
        updated_at = NOW()
      WHERE user_id = $3
      RETURNING user_id, email, role_id, tenant_id, created_at, updated_at
    `,
    assignRole:
      'UPDATE general_schema.users SET role_id = $1 WHERE user_id = $2',
    delete:
      'DELETE FROM general_schema.users WHERE user_id = $1 RETURNING user_id, email',
    getByEmails: `
      SELECT user_id, email FROM general_schema.users
      WHERE email = ANY($1)
      ORDER BY created_at DESC
    `,
  },

  role: {
    all: 'SELECT * FROM general_schema.role',
  },

  identificationType: {
    all: 'SELECT * FROM general_schema.identification_type',
    byId: 'SELECT * FROM general_schema.identification_type WHERE identification_type_id = $1',
    delete:
      'DELETE FROM general_schema.identification_type WHERE identification_type_id = $1',
  },

  customer: {
    all: `
      SELECT
        tenant_customer_id AS customer_id, tenant_id,
        first_name, last_name,
        identification_type_id AS doc_type,
        document_number AS doc_number,
        econ_activity, email, phone, birthdate, address,
        customer_segment_id AS segment_id,
        is_tenant, created_at, updated_at
      FROM general_schema.tenant_customer
      WHERE tenant_id = $1
    `,
    allPaginated: `
      SELECT
        tenant_customer_id AS customer_id, tenant_id,
        first_name, last_name,
        identification_type_id AS doc_type,
        document_number AS doc_number,
        econ_activity, email, phone, birthdate, address,
        customer_segment_id AS segment_id,
        is_tenant, created_at, updated_at
      FROM general_schema.tenant_customer
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
    allGlobal: `
      SELECT
        tc.tenant_customer_id AS customer_id, tc.tenant_id,
        tc.first_name, tc.last_name,
        tc.identification_type_id AS doc_type,
        tc.document_number AS doc_number,
        tc.econ_activity, tc.email, tc.phone, tc.birthdate, tc.address,
        tc.customer_segment_id AS segment_id,
        tc.is_tenant, tc.created_at, tc.updated_at,
        t.tenant_name
      FROM general_schema.tenant_customer tc
      LEFT JOIN general_schema.tenant t USING(tenant_id)
      ORDER BY tc.created_at DESC
      LIMIT $1 OFFSET $2
    `,
    countByTenant:
      'SELECT COUNT(*)::int AS total FROM general_schema.tenant_customer WHERE tenant_id = $1',
    countAll:
      'SELECT COUNT(*)::int AS total FROM general_schema.tenant_customer',
    byId: `
      SELECT
        tenant_customer_id AS customer_id, tenant_id,
        first_name, last_name,
        identification_type_id AS doc_type,
        document_number AS doc_number,
        econ_activity, email, phone, birthdate, address,
        customer_segment_id AS segment_id,
        is_tenant, created_at, updated_at
      FROM general_schema.tenant_customer
      WHERE tenant_customer_id = $1
    `,
    getInfo: `
      SELECT tc.first_name, tc.last_name, d.type_name, tc.document_number, tc.econ_activity, t.tenant_name, c.segment_name
      FROM general_schema.tenant_customer tc
      INNER JOIN general_schema.tenant t USING(tenant_id)
      INNER JOIN general_schema.customer_segment c USING(customer_segment_id)
      INNER JOIN general_schema.identification_type d ON d.identification_type_id = tc.identification_type_id
      WHERE tc.document_number = $1
    `,
    create: `
      INSERT INTO general_schema.tenant_customer
        (tenant_id, first_name, last_name, identification_type_id, document_number, econ_activity, email, phone, birthdate, address, created_at, updated_at, is_tenant)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11)
      RETURNING
        tenant_customer_id AS customer_id, tenant_id,
        first_name, last_name,
        identification_type_id AS doc_type,
        document_number AS doc_number,
        econ_activity, email, phone, birthdate, address,
        customer_segment_id AS segment_id,
        is_tenant, created_at, updated_at
    `,
    byEmail: `
      SELECT
        tenant_customer_id AS customer_id, tenant_id,
        first_name, last_name,
        identification_type_id AS doc_type,
        document_number AS doc_number,
        econ_activity, email, phone, birthdate, address,
        customer_segment_id AS segment_id,
        is_tenant, created_at, updated_at
      FROM general_schema.tenant_customer
      WHERE email = $1
    `,
    delete:
      'DELETE FROM general_schema.tenant_customer WHERE tenant_customer_id = $1',
  },

  region: {
    all: 'SELECT * FROM general_schema.region ORDER BY region_id',
  },

  tenant: {
    all: 'SELECT * FROM general_schema.tenant',
    byId: 'SELECT * FROM general_schema.tenant WHERE tenant_id = $1',
    create: `
    INSERT INTO general_schema.tenant (tenant_name, contact_email, contact_phone, identification, econ_activity, sign, is_subscribed, created_at, updated_at, region_id, identification_type_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $9)
    RETURNING *
    `,
    delete: 'DELETE FROM general_schema.tenant WHERE tenant_id = $1',
    updateStripeId:
      'UPDATE general_schema.tenant SET stripe_id = $1 WHERE tenant_id = $2',
  },

  tenantPayment: {
    all: 'SELECT * FROM general_schema.tenant_payment WHERE tenant_id = $1',
    create: `
    INSERT INTO general_schema.tenant_payment (tenant_id, payment_method_id, payment_amount, details)
    VALUES ($1, $2, $3, $4)
    RETURNING tenant_payment_id
    `,
  },

  productCategory: {
    all: 'SELECT product_category_id AS category_id, category_name FROM general_schema.product_category',
    allPaginated: `
      SELECT cabys_code AS category_id, product_name AS category_name
      FROM general_schema.product
      WHERE ($1::text IS NULL OR product_name ILIKE '%' || $1 || '%')
      ORDER BY product_name
      LIMIT $2 OFFSET $3
    `,
    allPaginatedByCabysCode: `
      SELECT cabys_code AS category_id, product_name AS category_name
      FROM general_schema.product
      WHERE ($1::text IS NULL OR cabys_code ILIKE $1 || '%')
      ORDER BY cabys_code
      LIMIT $2 OFFSET $3
    `,
    byId: 'SELECT product_category_id AS category_id, category_name, parent_category_id, hierarchy_level FROM general_schema.product_category WHERE product_category_id = $1',
    create:
      'INSERT INTO general_schema.product_category (category_name) VALUES ($1) RETURNING *',
    update:
      'UPDATE general_schema.product_category SET category_name = $1 WHERE product_category_id = $2',
    delete:
      'DELETE FROM general_schema.product_category WHERE product_category_id = $1',
  },

  customerSegmentMargin: {
    all: 'SELECT * FROM general_schema.customer_segment_margin',
    create: `
    INSERT INTO general_schema.customer_segment_margin (tenant_id, customer_segment_id, customer_segment_margin_type_id, spending_threshold, seniority_months, frequency_per_month)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    delete:
      'DELETE FROM general_schema.customer_segment_margin WHERE customer_segment_margin_id = $1',
    getInfo: `
    SELECT cm.customer_segment_margin_id, t.tenant_name, cs.segment_name, cmt.type_name, cm.spending_threshold, cm.seniority_months, cm.frequency_per_month FROM general_schema.customer_segment_margin cm
    INNER JOIN general_schema.tenant t USING(tenant_id)
    INNER JOIN general_schema.customer_segment cs USING(customer_segment_id)
    LEFT JOIN general_schema.customer_segment_margin_type cmt USING(customer_segment_margin_type_id)
    WHERE cm.tenant_id = $1 
    ORDER BY cm.customer_segment_margin_id
    `,
  },

  products: {
    getAll: `
    SELECT pv.product_variant_id, pv.sku, pv.variant_name, pv.cabys_code, pv.unit_price, pv.is_active
    FROM general_schema.product_variant pv
    WHERE pv.tenant_id = $1
    `,
    getAllPaginated: `
      SELECT pv.product_variant_id, pv.sku, pv.variant_name, pv.cabys_code, pv.unit_price, pv.is_active, pv.tenant_id
      FROM general_schema.product_variant pv
      WHERE pv.tenant_id = $1
      ORDER BY pv.sku
      LIMIT $2 OFFSET $3
    `,
    getAllGlobal: `
      SELECT pv.product_variant_id, pv.sku, pv.variant_name, pv.cabys_code, pv.unit_price, pv.is_active, pv.tenant_id, t.tenant_name
      FROM general_schema.product_variant pv
      LEFT JOIN general_schema.tenant t USING(tenant_id)
      ORDER BY t.tenant_name, pv.sku
      LIMIT $1 OFFSET $2
    `,
    countByTenant:
      'SELECT COUNT(*)::int AS total FROM general_schema.product_variant WHERE tenant_id = $1',
    countAll:
      'SELECT COUNT(*)::int AS total FROM general_schema.product_variant',
    getBySku: `
      SELECT pv.product_variant_id, pv.sku, pv.variant_name, pv.cabys_code, pv.unit_price, pv.is_active
      FROM general_schema.product_variant pv
      WHERE pv.sku = $1
      `,
    getById: `
      SELECT * FROM general_schema.product_variant
      WHERE product_variant_id = $1 AND tenant_id = $2
      LIMIT 1
      `,
    create: `
      INSERT INTO general_schema.product_variant (tenant_id, sku, variant_name, cabys_code, unit_price)
      SELECT $1, $2, $3, $4, $5
      WHERE NOT EXISTS (
        SELECT 1 FROM general_schema.product_variant pv
        WHERE pv.tenant_id = $1
        AND (pv.sku = $2 OR LOWER(pv.variant_name) = LOWER($3))
        )
        RETURNING *
        `,
    delete:
      'DELETE FROM general_schema.product_variant WHERE product_variant_id = $1',
  },

  customerPayment: {
    getPayments: `
    SELECT cp.payment_amount, pm.name, cp.payment_date, cp.verified, tc.first_name, tc.last_name, c.symbol FROM pos_schema.customer_payment cp
    INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
    INNER JOIN general_schema.payment_method pm USING(payments_method_id)
    INNER JOIN general_schema.currency c USING(currency_id)
    `,
    getCustomerPayments: `
    SELECT cp.payment_amount, pm.name, cp.payment_date, cp.verified, tc.first_name, tc.last_name, c.currency_code FROM pos_schema.customer_payment cp
    INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
    INNER JOIN general_schema.payment_method pm USING(payment_method_id)
    INNER JOIN general_schema.currency c USING(currency_id)
    WHERE cp.tenant_customer_id = $1
    `,
    createNewPayment: `
    INSERT INTO pos_schema.customer_payment (tenant_customer_id, sale_id, payment_method_id, payment_amount, payment_date, currency_id, verified)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    deletePayment:
      'DELETE FROM pos_schema.customer_payment WHERE customer_payment_id = $1',
  },

  branch: {
    all: `
    SELECT * FROM general_schema.branch
    `,
    allPaginated: `
      SELECT b.*, t.tenant_name FROM general_schema.branch b
      LEFT JOIN general_schema.tenant t USING(tenant_id)
      ORDER BY t.tenant_name, b.branch_name
      LIMIT $1 OFFSET $2
    `,
    countAll: 'SELECT COUNT(*)::int AS total FROM general_schema.branch',
    byId: `
    SELECT b.*, bl.provincia, bl.canton, bl.distrito, bl.otras_senas
    FROM general_schema.branch b
    LEFT JOIN general_schema.branch_location bl USING(branch_id)
    WHERE b.branch_id = $1 LIMIT 1
    `,
    byTenant: `
    SELECT * FROM general_schema.branch WHERE tenant_id = $1
    `,
    byTenantPaginated: `
      SELECT * FROM general_schema.branch
      WHERE tenant_id = $1
      ORDER BY branch_name
      LIMIT $2 OFFSET $3
    `,
    countByTenant:
      'SELECT COUNT(*)::int AS total FROM general_schema.branch WHERE tenant_id = $1',
    byName: `
    SELECT * FROM general_schema.branch WHERE branch_name = $1 LIMIT 1
    `,
    byIdAndTenant: `
    SELECT * FROM general_schema.branch WHERE branch_id = $1 AND tenant_id = $2 LIMIT 1
    `,
    update: `
    UPDATE general_schema.branch SET 
    branch_name = COALESCE($2, branch_name),
    branch_number = COALESCE($3, branch_number),
    branch_address = COALESCE($4, branch_address),
    contact_email = COALESCE($5, contact_email),
    is_main_branch = COALESCE($6, is_main_branch),
    updated_at = NOW()
    WHERE branch_id = $1
    RETURNING *
    `,
    create: `
    INSERT INTO general_schema.branch (tenant_id, branch_name, branch_number, branch_address, contact_email, is_main_branch, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *
    `,
    delete: `
    DELETE FROM general_schema.branch WHERE branch_id = $1 RETURNING *
    `,
  },

  subscriptions: {
    cancelSubscription:
      'UPDATE general_schema.tenant SET is_subscribed = false WHERE tenant_id = $1',
    createSubscription: `
    INSERT INTO general_schema.subscription (
      tenant_id, subscription_type_id, tenant_payment_id,
      start_date, end_date
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING subscription_id
    `,
  },

  customerSegment: {
    getSegments: `
      SELECT customer_segment_id, segment_name, segment_hierarchy FROM general_schema.customer_segment
    `,
    newSegments: `
      INSERT INTO general_schema.customer_segment (segment_name, segment_hierarchy)
      VALUES ($1, $2)
      RETURNING customer_segment_id
    `,
    deleteSegment: `
      DELETE FROM general_schema.customer_segment WHERE customer_segment_id = $1
      RETURNING customer_segment_id
    `,
  },

  tenantHaciendaConfig: {
    getByTenantId: `
      SELECT * FROM general_schema.tenant_hacienda_config
      WHERE tenant_id = $1 AND is_active = TRUE
      LIMIT 1
    `,
    create: `
      INSERT INTO general_schema.tenant_hacienda_config
      (tenant_id, hacienda_username, hacienda_password, hacienda_client_id, p12_base64, p12_password)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING tenant_hacienda_config_id
    `,
    update: `
      UPDATE general_schema.tenant_hacienda_config
      SET hacienda_username = $2,
          hacienda_password = $3,
          hacienda_client_id = $4,
          p12_base64 = $5,
          p12_password = $6,
          updated_at = NOW()
      WHERE tenant_id = $1 AND is_active = TRUE
    `,
    deactivate: `
      UPDATE general_schema.tenant_hacienda_config
      SET is_active = FALSE, updated_at = NOW()
      WHERE tenant_id = $1
    `,
  },
};

export const generalQueries = createQueries(generalQueryDefs);

export const bulkPayments = [
  'tenant_customer_id',
  'sale_id',
  'payment_method_id',
  'payment_amount',
  'payment_date',
  'currency_id',
  'verified',
];

export const bulkProducts = [
  'tenant_id',
  'sku',
  'variant_name',
  'cabys_code',
  'unit_price',
];
