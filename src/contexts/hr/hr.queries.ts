import { createQueries } from '@crane-technologies/database';

export const hrQueryDefs = {
  contract: {
    byId: `
    SELECT * FROM hr_schema.contract WHERE contract_id = $1 LIMIT 1
    `,
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
    getSchedule: `
    SELECT * FROM hr_schema.payment_schedule
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
      RETURNING p.paysheet_id, p.tenant_id, p.total_earnings, p.total_deductions, p.net_total;
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
};

export const hrQueries = createQueries(hrQueryDefs);
