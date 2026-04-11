import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IncapacityService } from './incapacity.service';
import { RegisterIncapacityDto, UpdateIncapacityDto } from './dto/register_incapacity.dto';

@Controller('incapacity')
export class IncapacityController {
  constructor(private readonly incService: IncapacityService) {}

  @Get("branch/:branchId")
  async getIncapacitiesByBranch(@Param("branchId") branchId: string) {
    return this.incService.getIncapacitiesByBranch(branchId);
  }

  @Get("employee/:employeeId")
  async getIncapacitiesByEmployee(@Param("employeeId") employeeId: string) {
    return this.incService.getIncapacitiesByEmployee(employeeId);
  }

  @Post()
  async registerIncapacity(@Body() data: RegisterIncapacityDto) {
    return this.incService.registerIncapacity(data);
  }

  @Patch(":id")
  async updateIncapacityRegister(@Param("id") id: string, @Body() data: UpdateIncapacityDto) {
    return this.incService.updateIncapacityRegister(id, data);
  }

  @Patch(":id/close")
  async closeIncapacityRegister(@Param("id") id: string) {
    return this.incService.closeIncapacity(id);
  }
}
