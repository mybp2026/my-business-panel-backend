import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { Employee, IEmployee } from './interface/employee.interface';
import { hrQueries } from '@hr/hr.queries';
import { NewEmployeeDto, NewSingleEmployeeDto } from './dto/newEmployeeDto.dto';
import { CreateFullEmployeeError } from '@/common/errors/create_full_employee.error';
import { UpdateEmployeeDto } from './dto/updateEmployee.dto';

const { employee } = hrQueries;

@Injectable()
export class EmployeeService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getEmployeesByTenant(tenantId: string): Promise<Employee[]> {
    const tenantEmployees = await this.db.query(employee.getByTenant, [
      tenantId,
    ]);

    if (tenantEmployees.rows.length === 0) return [];

    return tenantEmployees.rows;
  }

  async getEmployeeById(employee_id: string): Promise<IEmployee | null> {
    const result = await this.db.query(employee.getById, [employee_id]);
    if (result.rows.length === 0) return null;

    return result.rows[0];
  }

  async getEmployeesByBranchAndTenant(
    branchId: string,
    tenantId: string,
  ): Promise<Employee[]> {
    const branchEmployees = await this.db.query(employee.getByBranchAndTenant, [
      branchId,
      tenantId,
    ]);

    if (branchEmployees.rows.length === 0) return [];

    return branchEmployees.rows;
  }

  async createEmployeeWithContract(data: NewEmployeeDto) {
    const {
      user_id,
      tenant_id,
      branch_id,
      first_name,
      last_name,
      doc_number,
      phone,
      email,
      payment_schedule_id,
      contractData,
    } = data;

    const newEmp = await this.db.query(employee.full, [
      contractData.start_date,
      contractData.end_date,
      contractData.hours,
      contractData.base_salary,
      contractData.duties,
      contractData.turn_type,
      contractData.turn_id,
      user_id,
      tenant_id,
      first_name,
      last_name,
      doc_number,
      phone,
      email,
      payment_schedule_id,
      branch_id,
    ]);

    if (newEmp.rowCount === 0) return new CreateFullEmployeeError();

    return {
      message: 'Employee and Contract created successfully',
      employee: newEmp.rows[0],
    };
  }

  // Ask for this
  async createEmployee(data: NewSingleEmployeeDto) {
    const {
      user_id,
      tenant_id,
      first_name,
      last_name,
      doc_number,
      phone,
      email,
      payment_schedule_id,
    } = data;

    const newEmp = await this.db.query(employee.create, [
      user_id,
      tenant_id,
      first_name,
      last_name,
      doc_number,
      phone,
      email,
      payment_schedule_id,
    ]);

    if (newEmp.rowCount === 0) return new CreateFullEmployeeError();

    return {
      message: 'Employee created successfully',
      employee: newEmp.rows[0],
    };
  }

  async updateEmployeeInfo(employee_id: string, data: UpdateEmployeeDto) {
    const existingEmp = await this.db.query(employee.getById, [employee_id]);
    if (existingEmp.rows.length === 0) return new Error('Employee not found.');

    const {
      first_name,
      last_name,
      doc_number,
      phone,
      email,
      payment_schedule_id,
    } = data;

    const updatedEmp = await this.db.query(employee.update, [
      first_name,
      last_name,
      doc_number,
      phone,
      email,
      payment_schedule_id,
      employee_id,
    ]);

    if (updatedEmp.rowCount === 0)
      return new Error('Error updating employee info. Check input data.');

    return {
      message: 'Employee info updated successfully',
      employee: updatedEmp.rows[0],
    };
  }

  async deactivateEmployee(employee_id: string) {
    const existingEmp = await this.db.query(employee.getById, [employee_id]);
    if (existingEmp.rows.length === 0) return new Error('Employee not found.');

    await this.db.query(employee.deactivate, [employee_id]);

    return {
      message: `Employee with id: ${employee_id} deactivated successfully.`,
    };
  }

  async deleteEmployee(employee_id: string) {
    const existingEmp = await this.db.query(employee.getById, [employee_id]);
    if (existingEmp.rows.length === 0) return new Error('Employee not found.');

    await this.db.query(employee.delete, [employee_id]);

    return {
      message: `Employee with id: ${employee_id} deleted successfully.`,
    };
  }
}
