import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create_user.dto';
import Database from '@crane-technologies/database';
import { DATABASE } from '@/modules/db/db.provider';
import { IUserResult } from '@/modules/user/interfaces/user_result.interface';
import { queries } from '@/queries';
import { hash, hashSync } from 'bcrypt';
import { StateService } from '../state/state.service';
import { UserCreationError } from '@/common/errors/user_create.error';
import { AssignRoleDto } from '@/modules/user/dto/assign_role.dto';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { isUUID } from 'class-validator';
import { InvalidTenantError } from '@/common/errors/invalid_tenant.error';
import { EmployeeService } from '../employee/employee.service';
import { CreateFullEmployeeError } from '@/common/errors/create_full_employee.error';

@Injectable()
export class UserService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly state: StateService,
    private readonly employeeService: EmployeeService,
  ) {}

  async getUserByEmail(email: string): Promise<IUserResult | null> {
    const fetchedData = await this.db.query(queries.user.byEmailWithPassword, [
      email,
    ]);
    if (fetchedData.rows.length === 0) return null;
    return fetchedData.rows[0];
  }

  async getUsersByTenant(tenant_id: string): Promise<IUserResult[]> {
    if (isUUID(tenant_id) === false) throw new InvalidTenantError(tenant_id);

    const fetchedData = await this.db.query(queries.user.byTenant, [tenant_id]);
    return fetchedData.rows;
  }

  getUserRoles() {
    return this.state.getRoles();
  }

  getSelfInfo(user: IUserSession) {
    const { role_id, tenant_id, email } = user;
    const role = this.state.getRole(role_id);
    const tenant = this.state.getTenant(tenant_id);
    return { email, role, tenant };
  }

  async createUser(createUserDto: CreateUserDto) {
    const password_hash = await hash(
        createUserDto.password,
        this.state.getConstant<number>('PASSWORD_SALT_ROUNDS'),
      ),
      { tenant_id, email, role_id, employeeInfo } = createUserDto,
      txn = await this.db.transaction();

    try {
      const newUser = await txn.query(queries.user.create, [
        tenant_id,
        email,
        password_hash,
        role_id,
      ]);
      if (newUser.rows.length === 0) {
        throw new UserCreationError(email);
      }

      const userId = newUser.rows[0].user_id;

      const {
        base_salary,
        hours,
        start_date,
        end_date,
        duties,
        turn_type,
        turn_id,
      } = employeeInfo.contractData;

      const newEmployee = await txn.query(queries.employee.full, [
        start_date,
        end_date,
        hours,
        base_salary,
        duties,
        turn_type,
        turn_id,
        userId,
        employeeInfo.tenant_id,
        employeeInfo.first_name,
        employeeInfo.last_name,
        employeeInfo.doc_number,
        employeeInfo.phone,
        employeeInfo.email,
        employeeInfo.payment_schedule_id,
        employeeInfo.branch_id,
      ]);

      if (newEmployee.rows.length === 0) {
        throw new CreateFullEmployeeError();
      }

      await txn.commit();
      return { message: 'user created successfully!' };
    } catch (error) {
      await txn.rollback();
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createUsersBulk(createUserDto: CreateUserDto[]) {
    const saltRounds = this.state.getConstant<number>('PASSWORD_SALT_ROUNDS'),
      rows = createUserDto.map((dto) => {
        const validTenant =
          isUUID(dto.tenant_id) && this.state.getTenant(dto.tenant_id);
        if (!validTenant) throw new InvalidTenantError(dto.tenant_id);

        const password_hash = hashSync(dto.password, saltRounds);

        return [dto.tenant_id, dto.email, password_hash, dto.role_id];
      }),
      txn = await this.db.transaction();

    try {
      const userResult = await txn.bulkInsert(
        'general_schema.users',
        ['tenant_id', 'email', 'password_hash', 'role_id'],
        rows,
        { header: false, returnFields: ['user_id', 'email'] },
      );

      const userIds = (userResult.fields || []).map((row: any) => row.user_id);

      const contractRows = createUserDto.map((dto) => {
        const {
          start_date,
          end_date,
          hours,
          base_salary,
          duties,
          turn_type,
          turn_id,
        } = dto.employeeInfo.contractData;
        return [
          dto.tenant_id,
          start_date,
          end_date,
          hours,
          base_salary,
          duties,
          turn_type,
          turn_id,
        ];
      });

      const contractResult = await txn.bulkInsert(
        'hr_schema.contract',
        [
          'tenant_id',
          'start_date',
          'end_date',
          'hours',
          'base_salary',
          'duties',
          'turn_type',
          'turn_id',
        ],
        contractRows,
        { header: false, returnFields: ['contract_id'] },
      );

      const contractIds = (contractResult.fields || []).map(
        (row: any) => row.contract_id,
      );

      const employeeRows = createUserDto.map((dto, index) => {
        const userId = userIds[index];
        const contractId = contractIds[index];

        if (!userId) {
          throw new Error(
            `User ID not found for index: ${index} (email: ${dto.email})`,
          );
        }
        if (!contractId) {
          throw new Error(`Contract ID not found for index: ${index}`);
        }

        const {
          tenant_id,
          branch_id,
          first_name,
          last_name,
          doc_number,
          phone,
          email,
          payment_schedule_id,
        } = dto.employeeInfo;
        return [
          userId,
          tenant_id,
          branch_id,
          first_name,
          last_name,
          doc_number,
          phone,
          email,
          payment_schedule_id,
          contractId,
        ];
      });

      await txn.bulkInsert(
        'hr_schema.employee',
        [
          'user_id',
          'tenant_id',
          'branch_id',
          'first_name',
          'last_name',
          'doc_number',
          'phone',
          'email',
          'payment_schedule_id',
          'contract_id',
        ],
        employeeRows,
        { header: false },
      );

      await txn.commit();
      return {
        message: 'users created successfully!',
        count: rows.length,
        users: (userResult.fields || []).map((row: any) => ({
          user_id: row.user_id,
          email: row.email,
        })),
      };
    } catch (error) {
      await txn.rollback();
      console.error('Error bulk creating users:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async assignRole(assignRoleDto: AssignRoleDto) {
    await this.db.query(queries.user.assignRole, [
      assignRoleDto.role_id,
      assignRoleDto.user_id,
    ]);
    return { message: 'role assigned successfully!' };
  }
}
