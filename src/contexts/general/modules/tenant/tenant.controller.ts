import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { NewTenantDto } from './dto/newTenant.dto';
import { UpdateTenantDto } from './dto/updateTenant.dto';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { UserService } from '../user/user.service';
import { InvalidTenantError } from '@/common/errors/invalid_tenant.error';

// ? @UseGuards(RoleAuthorizationGuard, LevelAuthorizationGuard)
@Controller('tenant')
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getAllTenants() {
    return this.tenantService.getAllTenants();
  }

  @Get(':id')
  async getSingleTenant(@Param('id') id: string) {
    return this.tenantService.getTenantById(id);
  }

  @Get(':id/users')
  async getUsersByTenant(@Param('id') id: string) {
    if (!id) throw new InvalidTenantError(id);
    return this.userService.getUsersByTenant(id);
  }

  @Post()
  async createTenant(@Body() req: NewTenantDto) {
    return this.tenantService.createTenant(req);
  }

  @Patch(':id')
  async updateTenant(@Param('id') id: string, @Body() req: UpdateTenantDto) {
    return this.tenantService.updateTenant(id, req);
  }

  @Delete(':id')
  async deleteTenant(@Param('id') id: string) {
    return this.tenantService.deleteTenant(id);
  }
}
