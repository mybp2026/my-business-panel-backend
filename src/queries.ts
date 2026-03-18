import { createQueries } from '@crane-technologies/database';

export const queries = createQueries({
  user: {
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
  contract: {
    byId: `SELECT * FROM hr_schema.contract WHERE contract_id = $1 LIMIT 1`,
    update: `
      UPDATE hr_schema.contract
      SET
        start_date = COALESCE($1, start_date),
        end_date = COALESCE($2, end_date),
        hours = COALESCE($3, hours),
        base_salary = COALESCE($4, base_salary),
        duties = COALESCE($5, duties),
        turn_type = COALESCE($6, turn_type),
        turn_id = COALESCE($7, turn_id)
      WHERE contract_id = $6
      RETURNING contract_id
    `,
    getSchedule: `SELECT * FROM hr_schema.payment_schedule`,
  },
  role: {
    all: 'SELECT * FROM general_schema.role',
  },
  document_type: {
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
  tenant_payment: {
    all: 'SELECT * FROM general_schema.tenant_payment WHERE tenant_id = $1',
    create: `
      INSERT INTO general_schema.tenant_payment (tenant_id, payment_method_id, payment_amount, details)
      VALUES ($1, $2, $3, $4)
      RETURNING tenant_payment_id
    `,
  },
  p_category: {
    all: 'SELECT * FROM general_schema.product_category',
    byId: 'SELECT * FROM general_schema.product_category WHERE product_category_id = $1',
    create:
      'INSERT INTO general_schema.product_category (category_name) VALUES ($1) RETURNING *',
    update:
      'UPDATE general_schema.product_category SET category_name = $1 WHERE product_category_id = $2',
    delete:
      'DELETE FROM general_schema.product_category WHERE product_category_id = $1',
  },
  customer_segment_margin: {
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
  customer_payment: {
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
  sales: {
    createSale: `
      INSERT INTO pos_schema.sale ( branch_id, tenant_customer_id, sale_condition, sale_date, currency_id, subtotal_amount, tax_amount, total_amount, is_completed, has_electronic_invoice)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING sale_id
    `,
    getSalesByBranch: `
      SELECT s.sale_id, s.sale_date, s.total_amount, s.subtotal_amount, s.tax_amount, s.is_completed, b.branch_id, b.branch_name, c.currency_code, c.symbol FROM pos_schema.sale s
      INNER JOIN general_schema.branch b USING(branch_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      WHERE s.branch_id = $1
    `,
    getSaleInfo: `
      SELECT * FROM pos_schema.sale s
      INNER JOIN general_schema.branch b USING(branch_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant_customer t USING(tenant_customer_id)
    `, //Pongan aqui cualquier info que requieran de la venta
    getConditions: `
      SELECT * FROM pos_schema.sale_condition
    `,
  },
  items: {
    getItems: `
      SELECT pv.variant_name, pv.sku, si.sale_item_id, si.quantity, si.unit_price, si.total_price FROM pos_schema.sale_item si
      INNER JOIN general_schema.product_variant pv
        ON pv.tenant_id = si.tenant_id AND pv.product_variant_id = si.product_variant_id
      WHERE si.sale_id = $1
    `, // ? add pagination
    getItemById: 'SELECT * FROM pos_schema.sale_item WHERE sale_item_id = $1',
    delete:
      'DELETE FROM pos_schema.sale_item WHERE sale_item_id = $1 RETURNING sale_item_id',
  },
  dInvoice: {
    create: `
      INSERT INTO pos_schema.digital_sale_invoice (tenant_customer_id, currency_id, subtotal_amount, tax_amount, total_amount, invoiced_at, updated_at, sale_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    getBills: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, i.subtotal_amount, i.total_amount, i.invoiced_at FROM pos_schema.digital_sale_invoice i
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant t ON t.tenant_id = tc.tenant_id
      WHERE t.tenant_id = $1
    `,
    getCustomerDInvoices: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, i.subtotal_amount, i.total_amount, i.invoiced_at FROM pos_schema.digital_sale_invoice i
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant t ON t.tenant_id = tc.tenant_id
      WHERE t.tenant_id = $1 AND tc.document_number = $2
    `,
    getDInvoiceById: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, i.subtotal_amount, i.total_amount, i.invoiced_at FROM pos_schema.digital_sale_invoice i
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant t ON t.tenant_id = tc.tenant_id
      WHERE i.digital_sale_invoice_id = $1
    `,
    deleteDInvoice:
      'DELETE FROM pos_schema.digital_sale_invoice WHERE digital_sale_invoice_id = $1 RETURNING digital_sale_invoice_id',
    updateAmount: `UPDATE pos_schema.digital_sale_invoice SET total_amount = total_amount - $1 WHERE digital_sale_invoice_id = $2`,
  },
  returns: {
    newTransaction: `
      INSERT INTO pos_schema.return_transaction (digital_sale_invoice_id, tenant_customer_id, total_refund_amount, refund_method, return_status_id, return_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING return_transaction_id
    `,
    find: `
      SELECT
          return_transaction_id,
          digital_sale_invoice_id,
          tenant_customer_id,
          total_refund_amount,
          refund_method,
          return_status_id,
          return_date
      FROM
          pos_schema.return_transaction
      WHERE
          ($1::uuid IS NULL OR digital_sale_invoice_id = $1)
          AND ($2::uuid IS NULL OR tenant_customer_id = $2)
          AND ($3::int IS NULL OR return_status_id = $3)
          AND ($4::int IS NULL OR refund_method = $4)
          AND ($5::timestamp IS NULL OR return_date >= $5)
          AND ($6::timestamp IS NULL OR return_date <= $6)
      ORDER BY return_date DESC`,
  },
  branch: {
    all: `SELECT * FROM general_schema.branch`,
    byId: `SELECT * FROM general_schema.branch WHERE branch_id = $1 LIMIT 1`,
    byTenant: `SELECT * FROM general_schema.branch WHERE tenant_id = $1`,
    byName: `SELECT * FROM general_schema.branch WHERE branch_name = $1 LIMIT 1`,
    byIdAndTenant: `SELECT * FROM general_schema.branch WHERE branch_id = $1 AND tenant_id = $2 LIMIT 1`,
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
    delete: `DELETE FROM general_schema.branch WHERE branch_id = $1 RETURNING *`,
  },
  cash_register: {
    all: `SELECT * FROM pos_schema.cash_register`,
    byId: `SELECT * FROM pos_schema.cash_register WHERE cash_register_id = $1 LIMIT 1`,
    byBranch: `SELECT * FROM pos_schema.cash_register WHERE branch_id = $1`,
    create: `INSERT INTO pos_schema.cash_register (branch_id, register_name, is_active, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
    delete: `DELETE FROM pos_schema.cash_register WHERE cash_register_id = $1 RETURNING *`,
    update: `UPDATE pos_schema.cash_register SET branch_id = COALESCE($2, branch_id), register_name = COALESCE($3, register_name), is_active = COALESCE($4, is_active), updated_at = NOW() WHERE cash_register_id = $1 RETURNING *`,
    startSession: `INSERT INTO pos_schema.cash_register_session (cash_register_id, opened_at, opening_amount, user_id, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *`,
    getSessionById: `SELECT * FROM pos_schema.cash_register_session WHERE cash_register_session_id = $1 LIMIT 1`,
    getSessionsByCashRegister: `SELECT * FROM pos_schema.cash_register_session WHERE cash_register_id = $1 ORDER BY opened_at DESC`,
    closeSession: `UPDATE pos_schema.cash_register_session SET closed_at = $1, closing_amount = $2, is_active = false WHERE cash_register_session_id = $3 RETURNING *`,
    registerTransaction: `INSERT INTO cash_register_sale_transaction (cash_register_session_id, amount, transaction_time, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
  },
  promotions: {
    getPromos: `
      SELECT p.promotion_name, p.promotion_code, c.segment_name, p.promotion_start_date, p.promotion_end_date, pt.type_name, p.is_active FROM pos_schema.promotion p
      INNER JOIN general_schema.customer_segment c USING(customer_segment_id)
      INNER JOIN pos_schema.promotion_type pt USING(promotion_type_id)
      WHERE p.tenant_id = $1
    `,
    getPromoInfo: `
      SELECT p.promotion_name, p.promotion_code, c.segment_name, p.promotion_start_date, p.promotion_end_date, p.is_active FROM pos_schema.promotion p
      INNER JOIN general_schema.customer_segment c USING(customer_segment_id)
      INNER JOIN pos_schema.promotion_type pt USING(promotion_type_id)
      WHERE p.promotion_id = $1 LIMIT 1
    `,
    insertPromo: `
      INSERT INTO pos_schema.promotion (tenant_id, promotion_name, promotion_code, promotion_description, promotion_type_id, customer_segment_id, promotion_start_date, promotion_end_date, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING promotion_id
    `,
    deletePromo:
      'DELETE FROM pos_schema.promotion WHERE promotion_id = $1 RETURNING promotion_id',
    updatePromo: `
      UPDATE pos_schema.promotion
      SET tenant_id = COALESCE($2, tenant_id),
          promotion_name = COALESCE($3, promotion_name),
          promotion_code = COALESCE($4, promotion_code),
          promotion_description = COALESCE($5, promotion_description),
          promotion_type_id = COALESCE($6, promotion_type_id),
          customer_segment_id = COALESCE($7, customer_segment_id),
          promotion_start_date = COALESCE($8, promotion_start_date),
          promotion_end_date = COALESCE($9, promotion_end_date),
          is_active = COALESCE($10, is_active)
      WHERE promotion_id = $1
      RETURNING promotion_id
    `,
  },
  promo_types: {
    getPromoTypes: `
      SELECT * FROM pos_schema.promotion_type
    `,
  },
  subscription: {
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
  customer_segment: {
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
  loyal_program: {
    create: `
      INSERT INTO pos_schema.loyalty_program (tenant_id, points_earned_per_currency_unit, points_redeemed_per_currency_unit, minimum_purchase_for_points, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `,
    all: `
      SELECT * FROM pos_schema.loyalty_program WHERE tenant_id = $1
    `,
    delete: `
      DELETE FROM pos_schema.loyalty_program WHERE loyalty_program_id = $1 RETURNING loyalty_program_id
    `,
    byId: `
      SELECT * FROM pos_schema.loyalty_program WHERE loyalty_program_id = $1 LIMIT 1
    `,
    update: `
      UPDATE pos_schema.loyalty_program
      SET
        points_per_dollar = COALESCE($2, points_per_dollar),
        points_per_currency_unit = COALESCE($3, points_per_currency_unit),
        minimum_purchase_for_points = COALESCE($4, minimum_purchase_for_points)
      WHERE loyalty_program_id = $1
      RETURNING loyalty_program_id
    `,
  },
  employee: {
    getById: `
      SELECT e.first_name, e.last_name, e.doc_number, e.phone, e.email, e.is_active, c.start_date, c.end_date, c.hours, c.base_salary, c.duties, c.turn_id, e.branch_id 
      FROM hr_schema.employee e 
      INNER JOIN hr_schema.contract c USING(contract_id)
      WHERE e.employee_id = $1 LIMIT 1
    `,
    getByTenant: `
      SELECT * FROM hr_schema.employee WHERE tenant_id = $1
    `,
    getByBranchAndTenant: `
      SELECT * FROM hr_schema.employee 
      WHERE branch_id = $1 AND tenant_id = $2 AND is_active = true
    `,
    create: `
      INSERT INTO hr_schema.employee (user_id, tenant_id, first_name, last_name, doc_number, phone, email, payment_schedule_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING employee_id
    `,
    update: `
      UPDATE hr_schema.employee
      SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        doc_number = COALESCE($3, doc_number),
        phone = COALESCE($4, phone),
        email = COALESCE($5, email),
        payment_schedule_id = COALESCE($6, payment_schedule_id)
      WHERE employee_id = $7
      RETURNING employee_id
    `,
    delete: `
      DELETE FROM hr_schema.employee WHERE employee_id = $1 RETURNING employee_id
    `,
    deactivate: `
      UPDATE hr_schema.employee SET is_active = false WHERE employee_id = $1 RETURNING employee_id
    `,
    full: `
    SELECT hr_schema.create_new_employee(
      $1::date,           
      $2::date,           
      $3::integer,        
      $4::numeric,        
      $5::text,           
      $6::integer,
      $7::integer,
      $8::uuid,           
      $9::uuid,           
      $10::varchar,        
      $11::varchar,       
      $12::varchar,       
      $13::varchar,       
      $14::varchar,       
      $15::integer,        
      $16::uuid        
    ) AS employee_id
  `,
  },
  clocking: {
    clock_in: `
      INSERT INTO hr_schema.clocking (employee_id, branch_id, clock_in, clock_out)
      VALUES ($1, $2, NOW(), NULL)
      RETURNING clocking_id
    `,
    clock_out: `
      UPDATE hr_schema.clocking
      SET 
        clock_out = NOW(),
        turn_hours = GREATEST(0, EXTRACT(EPOCH FROM (NOW() - clock_in)) / 3600)
      WHERE employee_id = $1 AND clock_in IS NOT NULL
      RETURNING clocking_id 
    `,
  },
  payroll: {
    createPaysheet: `
      INSERT INTO hr_schema.paysheet (
        tenant_id, 
        branch_id, 
        period_start, 
        period_end, 
        status_id
      ) VALUES ($1, $2, $3, $4, 1) -- 1 suele ser 'Pendiente' o 'Abierta'
      RETURNING paysheet_id;
    `,
    checkExistingPeriod: `
      SELECT paysheet_id 
      FROM hr_schema.paysheet 
      WHERE branch_id = $1 
        AND tenant_id = $2 
        AND (
          (period_start <= $4 AND period_end >= $3) 
        )
        AND status_id != 3; 
    `,
    getEmployeeContractForPayroll: `
      SELECT 
        e.employee_id,
        e.tenant_id,
        e.branch_id,
        c.contract_id,
        c.base_salary,
        c.hours,
        c.turn_type,
        e.payment_schedule_id
      FROM hr_schema.employee e
      INNER JOIN hr_schema.contract c USING(contract_id)
      WHERE e.tenant_id = $1 AND e.branch_id = $2 AND e.is_active = true
    `,
    getConcepts: `
      SELECT 
        concept_id,
        name,
        type,
        calculation_method,
        is_taxable,
        base_value,
        code
      FROM hr_schema.payroll_concept
      WHERE tenant_id = $1 AND is_active = true;
    `,
    insertDetail: `
      INSERT INTO hr_schema.paysheet_detail (
        paysheet_id, employee_id, contract_id, payment_method_id, 
        gross_salary, total_earnings, total_deduction, net_salary, pay_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING detail_id;
    `,
    insertMovement: `
      INSERT INTO hr_schema.payroll_movement (
        detail_id, concept_id, base_amount, calculated_amount, description
      ) VALUES ($1, $2, $3, $4, $5);
    `,
    insertPaysheet: `
      INSERT INTO hr_schema.paysheet (
        tenant_id, 
        branch_id, 
        period_start, 
        period_end, 
        status_id
      ) VALUES ($1, $2, $3, $4, 1)
      RETURNING paysheet_id;
    `,
    closePaysheet: `
      UPDATE hr_schema.paysheet p
      SET
        payment_date = NOW(),
        total_earnings = sub.earnings,
        total_deductions = sub.deductions,
        net_total = sub.net,
        status_id = 2 -- Cerrada
      FROM (
        SELECT
          paysheet_id,
          SUM(gross_salary) AS gross,
          SUM(total_earnings) AS earnings,
          SUM(total_deduction) AS deductions,
          SUM(net_salary) AS net
        FROM hr_schema.paysheet_detail
        WHERE paysheet_id = $1
        GROUP BY paysheet_id  
      ) AS sub
      WHERE p.paysheet_id = sub.paysheet_id
      RETURNING p.paysheet_id, p.net_total;
    `,
    verifyPaysheet: `
      SELECT COUNT(*) AS total
      FROM hr_schema.paysheet_detail
      WHERE paysheet_id = $1;
    `,
    getHoursWorked: `
      SELECT employee_id, clock_in::date AS work_date, SUM(turn_hours) AS total_hours
      FROM hr_schema.clocking
      WHERE branch_id = $1
        AND clock_in >= $2
        AND clock_out <= $3
      GROUP BY employee_id, work_date;
    `,
    getHistorycalPayrolls: `
      SELECT
        pd.employee_id,
        SUM(pd.gross_salary) AS gross
      FROM hr_schema.paysheet_detail pd
      INNER JOIN hr_schema.paysheet p USING(paysheet_id)
      WHERE p.branch_id = $1
        AND p.period_start >= (CURRENT_DATE - INTERVAL '50 weeks')
      GROUP BY pd.employee_id;
    `,
    getAguinaldos: `
      SELECT 
        pd.employee_id,
        SUM(pd.gross_salary) as total
      FROM hr_schema.paysheet_detail pd
      INNER JOIN hr_schema.paysheet p USING(paysheet_id)
      WHERE p.branch_id = $1
        AND p.period_start >= (date_trunc('year', CURRENT_DATE) - INTERVAL '1 month')  -- '2025-12-01' (Diciembre año anterior) Teniendo en cuenta la info compartida por el cliente
        AND p.period_end <= (date_trunc('year', CURRENT_DATE) + INTERVAL '11 months' - INTERVAL '1 day')    -- '2026-11-30' (Noviembre año actual)
        AND p.status_id = 2
      GROUP BY pd.employee_id;
    `,
    getHolidays: `
      SELECT date::date AS holiday_date, holiday_name, is_freeday, is_payable FROM hr_schema.holiday WHERE is_payable = true
    `,
    getIncapacities: `
      SELECT
        employee_id,
        type,
        period_start,
        period_end,
        days_paying,
        percentage_to_pay
      FROM hr_schema.incapacity
      WHERE branch_id = $1
        AND period_start >= $2
        AND period_end <= $3
        AND is_active = true
    `,
    getSuspentionPeriod: `
      SELECT employee_id, suspention_start, suspention_end FROM hr_schema.suspention
      WHERE is_active = true
      AND (suspention_start, suspention_end) OVERLAPS ($1, $2)
    `,
  },
  incapacities: {
    create: `
      INSERT INTO hr_schema.incapacity (
          employee_id, branch_id, type,
          period_start, period_end, days_paying, percentage_to_pay
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING incapacity_id;
    `,
    byBranch: `
      SELECT * FROM hr_schema.incapacity
      WHERE branch_id = $1 AND is_active = true
    `,
    byEmployee: `
      SELECT * FROM hr_schema.incapacity
      WHERE employee_id = $1
    `,
    update: `
      UPDATE hr_schema.incapacity
      SET
        type = COALESCE($2, type),
        period_start = COALESCE($3, period_start),
        period_end = COALESCE($4, period_end),
        days_paying = COALESCE($5, days_paying),
        percentage_to_pay = COALESCE($6, percentage_to_pay),
        is_active = COALESCE($7, is_active)
      WHERE incapacity_id = $1
      RETURNING incapacity_id;
    `,
    deactivate: `
      UPDATE hr_schema.incapacity
      SET is_active = false
      WHERE incapacity_id = $1
      RETURNING incapacity_id;  
    `,
  },
  concept: {
    getConceptById: `
      SELECT * FROM hr_schema.payroll_concept WHERE concept_id = $1 LIMIT 1
    `,
    createConcept: `
      INSERT INTO hr_schema.payroll_concept (
        tenant_id, 
        name, 
        type,
        calculation_method,
        is_taxable,
        base_value,
        code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING concept_id;
    `,
    updateConcept: `
      UPDATE hr_schema.payroll_concept
      SET
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        calculation_method = COALESCE($3, calculation_method),
        is_taxable = COALESCE($4, is_taxable),
        base_value = COALESCE($5, base_value)
      WHERE concept_id = $6
      RETURNING concept_id;
    `,
    softDelete: `
      UPDATE hr_schema.payroll_concept
      SET is_active = false
      WHERE concept_id = $1
      RETURNING concept_id;
    `,
    deleteConcept: `
      DELETE FROM hr_schema.payroll_concept WHERE concept_id = $1 RETURNING concept_id;
    `,
  },
  paysheet: {
    getTenantPaysheets: `
      SELECT * FROM hr_schema.paysheet WHERE tenant_id = $1
      ORDER BY created_at DESC
    `,
    getPaysheetById: `
      SELECT * FROM hr_schema.paysheet WHERE paysheet_id = $1 LIMIT 1
    `,
    getBranchPaysheets: `
      SELECT * FROM hr_schema.paysheet 
      WHERE  branch_id = $1
      ORDER BY created_at DESC
    `,
    getDetails: `
      SELECT * FROM hr_schema.paysheet_detail WHERE paysheet_id = $1
    `,
    filtrateByDate: `
      SELECT 
        p.paysheet_id,
        p.tenant_id,
        p.branch_id,
        p.period_start,
        p.period_end,
        p.payment_date,
        p.net_total,
        ps.status_description as paysheet_status
      FROM hr_schema.paysheet p
      INNER JOIN hr_schema.paysheet_status ps USING(status_id)
      WHERE p.branch_id = $1
        AND p.period_start >= $2
        AND p.period_end <= $3
      ORDER BY p.created_at DESC
    `,
  },
  payrollMovement: {
    getMovementsByPaysheet: `
      SELECT * FROM hr_schema.payroll_movement pm
      INNER JOIN hr_schema.paysheet_detail pd USING(detail_id)
      WHERE pd.paysheet_id = $1
    `,
    getMovementsByDetail: `
      SELECT * FROM hr_schema.payroll_movement WHERE detail_id = $1
    `,
  },
  suspention: {
    create: `
      INSERT INTO hr_schema.suspention(employee_id, suspention_start, suspention_end, reason, branch_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING suspention_id;
    `,
    getByBranch: `
      SELECT * FROM hr_schema.suspention WHERE branch_id = $1 AND is_active = true
    `,
    getById: `
      SELECT * FROM hr_schema.suspention WHERE suspention_id = $1 LIMIT 1
    `,
    getByEmployee: `
      SELECT * FROM hr_schema.suspention WHERE employee_id = $1 AND is_active = true
    `,
    updateSuspention: `
      UPDATE hr_schema.suspention
      SET
        suspention_start = COALESCE($1, suspention_start),
        suspention_end = COALESCE($2, suspention_end),
        reason = COALESCE($3, reason)
      WHERE suspention_id = $4 AND is_active = true
      RETURNING suspention_id;
    `,
    closeSuspention: `
      UPDATE hr_schema.suspention
      SET
        is_active = false
      WHERE suspention_id = $1
      RETURNING suspention_id;
    `,
    cronJobSuspention: `
      SELECT hr_schema.close_suspention()
    `,
  },
  turns: {
    create: `
      INSERT INTO hr_schema.turn (branch_id, entry, out)
      VALUES ($1, $2, $3)
      RETURNING turn_id;
    `,
    getEntry: `
      SELECT entry FROM hr_schema.turn WHERE turn_id = $1 LIMIT 1
    `,
    getOut: `
      SELECT out FROM hr_schema.turn WHERE turn_id = $1 LIMIT 1
    `,
    getByBranch: `
      SELECT * FROM hr_schema.turn WHERE branch_id = $1
    `,
    updateTurn: `
      UPDATE hr_schema.turn
      SET
        entry = COALESCE($1, entry),
        out = COALESCE($2, out)
      WHERE turn_id = $3
      RETURNING turn_id;
    `,
    deleteTurn: `
      DELETE FROM hr_schema.turn WHERE turn_id = $1 RETURNING turn_id;
    `,
  },
  foul: {
    create: `
      INSERT INTO hr_schema.foul(employee_id, branch_id, identificator, foul_date, foul_hour, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING foul_id;
    `,
    foulCounts: `
      SELECT COUNT(*) AS total_fouls
      FROM hr_schema.foul
      WHERE employee_id = $1
        AND foul_date >= (CURRENT_DATE - INTERVAL '30 days')
      GROUP BY employee_id;
    `,
    getByBranch: `
      SELECT employee_id, identificator, foul_date, foul_hour, description
      FROM hr_schema.foul
      WHERE branch_id = $1
        AND foul_date >= (CURRENT_DATE - INTERVAL '30 days')
    `,
    foulCountByBranch: `
      SELECT COUNT(*) AS total_fouls
      FROM hr_schema.foul
      WHERE branch_id = $1
        AND foul_date >= (CURRENT_DATE - INTERVAL '30 days')
    `,
    getByEmployee: `
      SELECT * FROM hr_schema.foul WHERE employee_id = $1
    `,
    getByPeriod: `
      SELECT * FROM hr_schema.foul
      WHERE foul_date >= $1 AND foul_date <= $2 
    `,
    cleanOldFouls: `
      DELETE FROM hr_schema.foul
      WHERE branch_id = $1 AND foul_date < (CURRENT_DATE - INTERVAL '1 month' * $2)
    `,
    getConfigforBranch: `
      SELECT branch_id, foul_expiration_months FROM hr_schema.config 
    `,
  },
  tardiness: {
    getByBranch: `
      SELECT type, log, registered_at FROM hr_schema.tardiness
      WHERE branch_id = $1
        AND registered_at >= (CURRENT_DATE - INTERVAL '30 days')
    `,
    getByEmployee: `
      SELECT type, log, registered_at FROM hr_schema.tardiness
      WHERE employee_id = $1
        AND registered_at >= (CURRENT_DATE - INTERVAL '30 days')
    `,
    getByPeriod: `
      SELECT type, log, registered_at FROM hr_schema.tardiness
      WHERE registered_at >= $1 AND registered_at <= $2 AND branch_id = $3 
    `,
    create: `
      INSERT INTO hr_schema.tardiness (employee_id, branch_id, type, log, registered_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING tardiness_id;
    `,
    getCountByEmployee: `
      SELECT COUNT(*) AS total FROM hr_schema.tardiness
      WHERE employee_id = $1
        AND registered_at >= (CURRENT_DATE - INTERVAL '30 days')
    `,
    getCountByBranch: `
      SELECT COUNT(*) AS total FROM hr_schema.tardiness
      WHERE branch_id = $1
        AND registered_at >= (CURRENT_DATE - INTERVAL '30 days')
    `,
    getCountByPeriod: `
      SELECT COUNT(*) AS total FROM hr_schema.tardiness
      WHERE registered_at >= $1 AND registered_at <= $2 AND branch_id = $3
    `,
  },
  eInvoice: {
    // Atomic upsert: increments the per-branch counter and returns the claimed value.
    // The row-level lock from INSERT ... ON CONFLICT DO UPDATE prevents race conditions.
    // $1 = branch_id (UUID)
    getNextInvoiceSequence: `
      INSERT INTO pos_schema.branch_einvoice_seq (branch_id, next_seq)
      VALUES ($1, 1)
      ON CONFLICT (branch_id) DO UPDATE
        SET next_seq = branch_einvoice_seq.next_seq + 1
      RETURNING next_seq
    `,
    // #1: status_id=1 (pending). next_check_at=NOW()+30s activa el cron como baseline.
    create: `
      INSERT INTO pos_schema.electronic_sale_invoice
      (sale_id, key_number, consecutive_number, xml_signed, status_id, check_attempts, next_check_at, created_at)
      VALUES ($1, $2, $3, $4, 1, 0, NOW() + INTERVAL '30 seconds', NOW())
      RETURNING electronic_sale_invoice_id
    `,
    // Cron: facturas pendientes cuyo next_check_at ya venció (máx. 100 por tick)
    getPendingInvoices: `
      SELECT electronic_sale_invoice_id, key_number, check_attempts
      FROM pos_schema.electronic_sale_invoice
      WHERE status_id = 1
        AND check_attempts < 20
        AND next_check_at <= NOW()
      ORDER BY next_check_at
      LIMIT 100
    `,
    // $1 = electronic_sale_invoice_id, $2 = check_attempts, $3 = next_check_at
    updateCheckAttempt: `
      UPDATE pos_schema.electronic_sale_invoice
      SET check_attempts = $2,
          next_check_at  = $3,
          updated_at     = NOW()
      WHERE electronic_sale_invoice_id = $1
    `,
    // #5: persiste los ítems en electronic_sale_invoice_items
    insertItem: `
      INSERT INTO pos_schema.electronic_sale_invoice_items
      (electronic_sale_invoice_id, tenant_id, product_variant_id, sale_item_id, line_number, discount_amount)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING electronic_sale_invoice_item_id
    `,
    // #6: verifica que exista una digital_sale_invoice antes de generar la electrónica
    getDInvoice: `
      SELECT digital_sale_invoice_id
      FROM pos_schema.digital_sale_invoice
      WHERE sale_id = $1
      LIMIT 1
    `,
    markSaleAsEInvoiced: `
      UPDATE pos_schema.sale SET has_electronic_invoice = true WHERE sale_id = $1
    `,
    // $1 = electronic_sale_invoice_id, $2 = hacienda_response_xml (TEXT), $3 = status_id
    // status_id: 1=pendiente, 2=aceptada, 3=rechazada
    updateHaciendaResponse: `
      UPDATE pos_schema.electronic_sale_invoice
      SET hacienda_response_xml  = $2,
          hacienda_response_date = NOW(),
          status_id              = $3,
          updated_at             = NOW()
      WHERE electronic_sale_invoice_id = $1
    `,
    getEInvoicesByBranch: `
      SELECT * FROM pos_schema.electronic_sale_invoice e
      INNER JOIN pos_schema.sale s USING(sale_id)
      WHERE s.branch_id = $1;
    `,
    getEInvoiceForSale: `
      SELECT * FROM pos_schema.electronic_sale_invoice e
      INNER JOIN pos_schema.sale s USING(sale_id)
      WHERE e.sale_id = $1;
    `,
    getEInvoiceById: `
      SELECT * FROM pos_schema.electronic_sale_invoice e
      INNER JOIN pos_schema.sale s USING(sale_id)
      WHERE e.electronic_sale_invoice_id = $1; 
    `,
    getSaleForEInvoice: `
      SELECT
        s.sale_id,
        s.branch_id,
        s.sale_condition,
        s.is_completed,
        s.has_electronic_invoice,
        EXISTS (
          SELECT 1 FROM pos_schema.electronic_sale_invoice e WHERE e.sale_id = s.sale_id
        ) AS already_invoiced,
        -- #3: extraer solo los 10 dígitos numéricos (posición 11-20) y castear a bigint
        COALESCE(
          (SELECT MAX(SUBSTRING(seq.consecutive_number FROM 11 FOR 10)::bigint)
          FROM pos_schema.electronic_sale_invoice seq
          INNER JOIN pos_schema.sale s2 ON s2.sale_id = seq.sale_id
          WHERE s2.branch_id = s.branch_id), 0
        )::bigint AS invoice_sequence,
        cur.currency_code,
        1.00000::numeric AS exchange_rate,
        s.subtotal_amount,
        s.tax_amount,
        s.total_amount,
        pm.code AS payment_method_code,
        t.econ_activity   AS activity_code,
        t.tenant_name     AS issuer_name,
        t.identification  AS issuer_identification,
        '02'::VARCHAR(2)  AS issuer_identification_type,
        t.contact_email   AS issuer_email,
        COALESCE(loc.provincia,   '1')  AS provincia,
        COALESCE(loc.canton,      '01') AS canton,
        COALESCE(loc.distrito,    '01') AS distrito,
        COALESCE(loc.otras_senas, '')   AS otras_senas,
        (tc.first_name || ' ' || tc.last_name) AS receiver_name,
        tc.document_number                     AS receiver_identification,
        COALESCE(dt.ident_code, '01')          AS receiver_identification_type,
        tc.email                               AS receiver_email,
        -- TODO: Discriminar servicios/mercancías cuando se agregue is_service a product
        0.00::numeric        AS total_serv_gravados,
        0.00::numeric        AS total_serv_exentos,
        0.00::numeric        AS total_serv_exonerados,
        s.subtotal_amount    AS total_mercancias_gravadas,
        0.00::numeric        AS total_mercancias_exentas,
        0.00::numeric        AS total_mercancias_exoneradas,
        COALESCE(
          (SELECT COUNT(*)::integer FROM pos_schema.cash_register cr2
           WHERE cr2.branch_id = b.branch_id AND cr2.created_at <= cr.created_at),
          1
        ) AS terminal_number,
        1 AS pos_number
      FROM pos_schema.sale s
      JOIN general_schema.branch b            ON b.branch_id = s.branch_id
      JOIN general_schema.tenant t            ON t.tenant_id = b.tenant_id
      LEFT JOIN general_schema.tenant_location loc ON loc.tenant_id = t.tenant_id
      JOIN general_schema.tenant_customer tc  ON tc.tenant_customer_id = s.tenant_customer_id
      LEFT JOIN general_schema.document_type dt ON dt.document_type_id = tc.document_type_id
      JOIN general_schema.currency cur        ON cur.currency_id = s.currency_id
      LEFT JOIN LATERAL (
        SELECT
          CASE pm2.name
            WHEN 'cash'        THEN '01'
            WHEN 'debit_card'  THEN '02'
            WHEN 'credit_card' THEN '02'
            WHEN 'credit'      THEN '04'
            ELSE '99'
          END AS code
        FROM pos_schema.customer_payment cp2
        JOIN general_schema.payment_method pm2 ON pm2.payment_method_id = cp2.payment_method_id
        WHERE cp2.sale_id = s.sale_id
        LIMIT 1
      ) pm ON true
      LEFT JOIN pos_schema.cash_register_sale crs ON crs.sale_id = s.sale_id
      LEFT JOIN pos_schema.cash_register_session crss ON crss.cash_register_session_id = crs.cash_register_session_id
      LEFT JOIN pos_schema.cash_register cr ON cr.cash_register_id = crss.cash_register_id
      WHERE s.sale_id = $1
    `,

    getSaleItemsForEInvoice: `
      SELECT
      ROW_NUMBER() OVER (ORDER BY si.created_at)::integer AS line_number,
      si.sale_item_id,
      si.product_variant_id,
      pv.tenant_id,
      pv.cabys_code,
      pv.variant_name::varchar(200) AS description,
      si.quantity::numeric(16,3),
      'Unid'::varchar(20) AS unit_of_measure,
      si.unit_price::numeric(18,5),
      si.total_price::numeric(18,5) AS total_amount,
      0.00::numeric(18,5) AS discount_amount,
      si.total_price::numeric(18,5) AS subtotal,
      CASE WHEN tr.tax_rate_id IS NOT NULL THEN '01' END::varchar(2) AS tax_code,
      COALESCE(
        tr.rate_code,
        CASE
          WHEN COALESCE(tr.rate_percentage, 0) = 0      THEN '01'
          WHEN COALESCE(tr.rate_percentage, 0) <= 0.015 THEN '05'
          WHEN COALESCE(tr.rate_percentage, 0) <= 0.025 THEN '06'
          WHEN COALESCE(tr.rate_percentage, 0) <= 0.05  THEN '07'
          WHEN COALESCE(tr.rate_percentage, 0) <= 0.14  THEN '08'
          ELSE '01'
        END
      )::varchar(2) AS tax_rate_code,
      (COALESCE(tr.rate_percentage, 0) * 100)::numeric(5,2) AS tax_rate,
      (si.total_price * COALESCE(tr.rate_percentage, 0))::numeric(18,5) AS tax_amount,
      (si.total_price * (1 + COALESCE(tr.rate_percentage, 0)))::numeric(18,5) AS total_line_amount
      FROM pos_schema.sale_item si
      JOIN general_schema.product_variant pv
        ON pv.tenant_id = si.tenant_id AND pv.product_variant_id = si.product_variant_id
      LEFT JOIN general_schema.product p     ON p.cabys_code = pv.cabys_code
      LEFT JOIN general_schema.tax_rate tr   ON tr.tax_rate_id = p.tax_rate_id
      WHERE si.sale_id = $1
      ORDER BY si.created_at;
    `,
  },
});

export const bulkItems = [
  'sale_id',
  'tenant_id',
  'product_id',
  'quantity',
  'unit_price',
  'total_price',
];

export const bulkReturns = [
  'return_transaction_id',
  'quantity',
  'unit_price',
  'total_price',
  'sale_item_id',
];

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
