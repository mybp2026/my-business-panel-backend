import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { IUserResult } from '@/contexts/general/modules/user/interfaces/user_result.interface';
import { StateService } from '../state/state.service';
import { EmployeeService } from '@/contexts/hr/modules/employee/employee.service';

export { IUserResult };

@Module({
  controllers: [UserController],
  providers: [UserService, StateService, EmployeeService],
  exports: [UserService],
})
export class UserModule {}
