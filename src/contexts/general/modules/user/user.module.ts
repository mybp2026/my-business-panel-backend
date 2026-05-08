import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { IUserResult } from '@/contexts/general/modules/user/interfaces/user_result.interface';
import { EmployeeService } from '@/contexts/hr/modules/employee/employee.service';

export { IUserResult };

// StateService no se declara aquí porque StateModule es @Global() y provee
// una instancia compartida en toda la aplicación. Declararla en providers
// crearía una segunda instancia separada, rompiendo el cache en memoria.
@Module({
  controllers: [UserController],
  providers: [UserService, EmployeeService],
  exports: [UserService],
})
export class UserModule {}
