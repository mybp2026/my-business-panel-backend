-- ============================================================
-- MIGRATION: Fix missing tables and columns
-- Date: 2026-06-10
-- ============================================================

-- ============================================================
-- 1. tax_regime enum + column on general_schema.tenant
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'tax_regime'
          AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'general_schema')
    ) THEN
        CREATE TYPE general_schema.tax_regime AS ENUM ('traditional', 'simplified');
    END IF;
END $$;

ALTER TABLE general_schema.tenant
    ADD COLUMN IF NOT EXISTS tax_regime general_schema.tax_regime NOT NULL DEFAULT 'traditional';

COMMENT ON COLUMN general_schema.tenant.tax_regime IS
    'Tenant tax regime: traditional (régimen general IVA) or simplified (régimen simplificado, Decreto 38 MH).';

-- ============================================================
-- 2. is_composite column on general_schema.product_variant
-- ============================================================

ALTER TABLE general_schema.product_variant
    ADD COLUMN IF NOT EXISTS is_composite BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- 3. general_schema.product_variant_composition table
-- ============================================================

CREATE TABLE IF NOT EXISTS general_schema.product_variant_composition (
    tenant_id                  uuid    NOT NULL,
    parent_product_variant_id  uuid    NOT NULL,
    child_product_variant_id   uuid    NOT NULL,
    quantity                   numeric(12,3) NOT NULL CHECK (quantity > 0),
    created_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, parent_product_variant_id, child_product_variant_id),
    CHECK (parent_product_variant_id <> child_product_variant_id),
    FOREIGN KEY (tenant_id, parent_product_variant_id)
        REFERENCES general_schema.product_variant(tenant_id, product_variant_id)
        ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, child_product_variant_id)
        REFERENCES general_schema.product_variant(tenant_id, product_variant_id)
        ON DELETE RESTRICT
) PARTITION BY HASH (tenant_id);

DO $$ DECLARE i INT; BEGIN
  FOR i IN 0..7 LOOP
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS general_schema.product_variant_composition_p%s
       PARTITION OF general_schema.product_variant_composition
       FOR VALUES WITH (MODULUS 8, REMAINDER %s);', i, i);
  END LOOP;
END $$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS idx_pvc_parent
    ON general_schema.product_variant_composition (tenant_id, parent_product_variant_id);
CREATE INDEX IF NOT EXISTS idx_pvc_child
    ON general_schema.product_variant_composition (tenant_id, child_product_variant_id);

COMMENT ON TABLE general_schema.product_variant_composition IS
    'Composite product variants: parent explodes into N children with a quantity ratio.';

-- ============================================================
-- 4. accounting_schema (create schema if missing)
-- ============================================================

CREATE SCHEMA IF NOT EXISTS accounting_schema;

-- ============================================================
-- accounting_schema.expense_category table
-- ============================================================

CREATE TABLE IF NOT EXISTS accounting_schema.expense_category (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES general_schema.tenant(tenant_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    account_code VARCHAR(20) NOT NULL,
    parent_category_id UUID REFERENCES accounting_schema.expense_category(category_id) ON DELETE SET NULL,
    is_fixed BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, name),
    CONSTRAINT chk_no_self_parent_cat CHECK (category_id != parent_category_id)
);

CREATE INDEX IF NOT EXISTS idx_expense_cat_tenant
    ON accounting_schema.expense_category(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expense_cat_active
    ON accounting_schema.expense_category(tenant_id, is_active)
    WHERE is_active = TRUE;

COMMENT ON TABLE accounting_schema.expense_category IS
    'Expense categories that map to chart of accounts codes. is_fixed=TRUE for recurring/fixed expenses, FALSE for variable.';

-- ============================================================
-- 5. accounting_schema.expense table
-- ============================================================

CREATE TABLE IF NOT EXISTS accounting_schema.expense (
    expense_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES general_schema.tenant(tenant_id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES general_schema.branch(branch_id),
    category_id UUID NOT NULL REFERENCES accounting_schema.expense_category(category_id),
    description TEXT,
    amount NUMERIC(14,4) NOT NULL CHECK (amount > 0),
    tax_amount NUMERIC(14,4) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount NUMERIC(14,4) NOT NULL CHECK (total_amount > 0),
    currency_id INTEGER NOT NULL REFERENCES general_schema.currency(currency_id),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH'
        CHECK (payment_method IN ('CASH', 'BANK', 'CREDIT_CARD', 'CHECK', 'TRANSFER')),
    reference_number VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES general_schema.users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expense_tenant
    ON accounting_schema.expense(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expense_branch
    ON accounting_schema.expense(branch_id);
CREATE INDEX IF NOT EXISTS idx_expense_date
    ON accounting_schema.expense(tenant_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expense_category
    ON accounting_schema.expense(category_id);

COMMENT ON TABLE accounting_schema.expense IS
    'Individual expense records. Each expense generates a journal entry via generateExpenseJournal().';

-- ============================================================
-- 6. accounting_schema.fiscal_period table
-- ============================================================

CREATE TABLE IF NOT EXISTS accounting_schema.fiscal_period (
    period_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES general_schema.tenant(tenant_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, name),
    CONSTRAINT chk_period_dates CHECK (end_date > start_date)
);

-- ============================================================
-- 7. accounting_schema.expense_category_template table + data
-- ============================================================

CREATE TABLE IF NOT EXISTS accounting_schema.expense_category_template (
    template_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    account_code VARCHAR(20) NOT NULL,
    is_fixed BOOLEAN DEFAULT TRUE,
    parent_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO accounting_schema.expense_category_template(name, account_code, is_fixed, parent_name)
SELECT * FROM (VALUES
    ('Salarios y Sueldos',               '5-1-001', TRUE,  NULL),
    ('Cargas Sociales',                   '5-1-002', TRUE,  NULL),
    ('Alquiler',                          '5-1-003', TRUE,  NULL),
    ('Servicios Públicos',                '5-1-004', TRUE,  NULL),
    ('Depreciación',                      '5-1-005', TRUE,  NULL),
    ('Seguros',                           '5-1-006', TRUE,  NULL),
    ('Suministros de Oficina',            '5-1-007', TRUE,  NULL),
    ('Mantenimiento y Reparaciones',      '5-1-008', TRUE,  NULL),
    ('Publicidad y Mercadeo',             '5-1-009', TRUE,  NULL),
    ('Gastos de Viaje',                   '5-1-010', TRUE,  NULL),
    ('Intereses Pagados',                 '5-2-001', TRUE,  NULL),
    ('Comisiones Bancarias',              '5-2-002', TRUE,  NULL),
    ('Diferencial Cambiario',             '5-2-003', TRUE,  NULL),
    ('Comisiones por Ventas',             '5-3-001', FALSE, NULL),
    ('Empaque y Embalaje',                '5-3-002', FALSE, NULL),
    ('Transporte y Envíos',               '5-3-003', FALSE, NULL),
    ('Materiales de Producción',          '5-3-004', FALSE, NULL)
) AS v(name, account_code, is_fixed, parent_name)
ON CONFLICT (name) DO NOTHING;

-- Ver ambas filas para 13% (y repetir para 1/2/4/7/8/10/20 si aplica)
SELECT tax_rate_id, region, rate_percentage, rate_code, rate_name
FROM general_schema.tax_rate
WHERE region = 'Costa Rica' OR rate_percentage IN (0.13, 13.00);




