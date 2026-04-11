import { createQueries } from '@crane-technologies/database';

export const generalQueryDefs = {
  users: {
    all: 'SELECT user_id, email, role_id, tenant_id FROM general_schema.users',
    byId: 'SELECT user_id, email, role_id FROM general_schema.users WHERE user_id = $1 LIMIT 1',
    byEmail:
      'SELECT user_id, email, role_id FROM general_schema.users WHERE email = $1 LIMIT 1',
    byTenant:
      'SELECT user_id, email, role_id FROM general_schema.users WHERE tenant_id = $1',
    byEmailWithPassword:
      'SELECT * FROM general_schema.users WHERE email = $1 LIMIT 1',
    create: `
      INSERT INTO general_schema.users 
      (tenant_id, email, password_hash, role_id, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, NOW(), NOW()) 
      RETURNING *
    `,
    assignRole:
      'UPDATE general_schema.users SET role_id = $1 WHERE user_id = $2',
    getByEmails: `
      SELECT user_id, email FROM general_schema.users 
      WHERE email = ANY($1) 
      ORDER BY created_at DESC
    `,
  },

  role: {
    all: 'SELECT * FROM general_schema.role',
  },

  documentType: {
    all: 'SELECT * FROM general_schema.document_type',
    byId: 'SELECT * FROM general_schema.document_type WHERE document_type_id = $1',
    delete:
      'DELETE FROM general_schema.document_type WHERE document_type_id = $1',
  },

  customer: {
    all: 'SELECT * FROM general_schema.tenant_customer WHERE tenant_id = $1',
    byId: 'SELECT * FROM general_schema.tenant_customer WHERE tenant_customer_id = $1',
    getInfo: `
    SELECT tc.first_name, tc.last_name, d.type_name, tc.document_number, tc.econ_activity, t.tenant_name, c.segment_name FROM general_schema.tenant_customer tc
    INNER JOIN general_schema.tenant t USING(tenant_id)
    INNER JOIN general_schema.customer_segment c USING(customer_segment_id)
    INNER JOIN general_schema.document_type d USING(document_type_id)
    WHERE tc.document_number = $1
    `,
    create: `
    INSERT INTO general_schema.tenant_customer (tenant_id, first_name, last_name, document_type_id, document_number, econ_activity, email, phone, birthdate, address, created_at, updated_at, is_tenant)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11)
    RETURNING *
    `,
    byEmail: 'SELECT * FROM general_schema.tenant_customer WHERE email = $1',
    delete:
      'DELETE FROM general_schema.tenant_customer WHERE tenant_customer_id = $1',
  },

  tenant: {
    all: 'SELECT * FROM general_schema.tenant',
    byId: 'SELECT * FROM general_schema.tenant WHERE tenant_id = $1',
    create: `
    INSERT INTO general_schema.tenant (tenant_name, contact_email, identification, econ_activity, sign, is_subscribed, created_at, updated_at, region_id)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
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
    all: 'SELECT * FROM general_schema.product_category',
    byId: 'SELECT * FROM general_schema.product_category WHERE product_category_id = $1',
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
    byId: `
    SELECT * FROM general_schema.branch WHERE branch_id = $1 LIMIT 1
    `,
    byTenant: `
    SELECT * FROM general_schema.branch WHERE tenant_id = $1
    `,
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
    address = COALESCE($3, address),
    contact_email = COALESCE($4, contact_email),
    is_main_branch = COALESCE($5, is_main_branch),
    updated_at = NOW()
    WHERE branch_id = $1
    RETURNING *
    `,
    create: `
    INSERT INTO general_schema.branch (tenant_id, branch_name, branch_number, address, contact_email, is_main_branch, created_at, updated_at)
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
