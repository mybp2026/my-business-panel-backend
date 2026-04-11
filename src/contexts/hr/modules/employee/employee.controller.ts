import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { NewEmployeeDto } from './dto/newEmployeeDto.dto';
import { UpdateEmployeeDto } from './dto/updateEmployee.dto';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get(':tenant_id')
  async getEmployeesByTenant(@Param('tenant_id') tenant_id: string) {
    return this.employeeService.getEmployeesByTenant(tenant_id);
  }

  @Get('detail/:id')
  async getEmployeeById(@Param('id') id: string) {
    return this.employeeService.getEmployeeById(id);
  }

  @Post()
  async createEmployee(@Body() data: NewEmployeeDto) {
    return this.employeeService.createEmployeeWithContract(data);
  }

  @Patch(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() data: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateEmployeeInfo(id, data);
  }

  @Patch('deactivate/:id')
  async deactivateEmployee(@Param('id') id: string) {
    return this.employeeService.deactivateEmployee(id);
  }

  @Delete(':id')
  async deleteEmployee(@Param('id') id: string) {
    return this.employeeService.deleteEmployee(id);
  }
}
