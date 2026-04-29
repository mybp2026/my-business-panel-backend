import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { TenantService } from './tenant.service';
import { NewTenantDto } from './dto/newTenant.dto';
import { UpdateTenantDto } from './dto/updateTenant.dto';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { UserService } from '../user/user.service';
import { InvalidTenantError } from '@/common/errors/invalid_tenant.error';
import {
  getAllTenantsDoc,
  getSingleTenantDoc,
  getUsersByTenantDoc,
  createTenantDoc,
  updateTenantDoc,
  deleteTenantDoc,
} from '@/docs/contexts/general/tenant';

// ? @UseGuards(RoleAuthorizationGuard, LevelAuthorizationGuard)
@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation(getAllTenantsDoc.operation)
  @ApiResponse(getAllTenantsDoc.responses[200])
  @ApiResponse(getAllTenantsDoc.responses[401])
  @Get()
  async getAllTenants() {
    return this.tenantService.getAllTenants();
  }

  @ApiOperation(getSingleTenantDoc.operation)
  @ApiResponse(getSingleTenantDoc.responses[200])
  @ApiResponse(getSingleTenantDoc.responses[401])
  @Get(':id')
  async getSingleTenant(@Param('id') id: string) {
    return this.tenantService.getTenantById(id);
  }

  @ApiOperation(getUsersByTenantDoc.operation)
  @ApiResponse(getUsersByTenantDoc.responses[200])
  @ApiResponse(getUsersByTenantDoc.responses[400])
  @ApiResponse(getUsersByTenantDoc.responses[401])
  @Get(':id/users')
  async getUsersByTenant(@Param('id') id: string) {
    if (!id) throw new InvalidTenantError(id);
    return this.userService.getUsersByTenant(id);
  }

  @ApiOperation(createTenantDoc.operation)
  @ApiResponse(createTenantDoc.responses[201])
  @ApiResponse(createTenantDoc.responses[400])
  @ApiResponse(createTenantDoc.responses[401])
  @Post()
  async createTenant(
    @Body() req: NewTenantDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.tenantService.createTenant(req);

    if (result.token) {
      response.cookie('auth_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });
      const { token, ...data } = result;
      return data;
    }

    return result;
  }

  @ApiOperation(updateTenantDoc.operation)
  @ApiResponse(updateTenantDoc.responses[200])
  @ApiResponse(updateTenantDoc.responses[400])
  @ApiResponse(updateTenantDoc.responses[401])
  @Patch(':id')
  async updateTenant(@Param('id') id: string, @Body() req: UpdateTenantDto) {
    return this.tenantService.updateTenant(id, req);
  }

  @ApiOperation(deleteTenantDoc.operation)
  @ApiResponse(deleteTenantDoc.responses[200])
  @ApiResponse(deleteTenantDoc.responses[401])
  @ApiResponse(deleteTenantDoc.responses[404])
  @Delete(':id')
  async deleteTenant(@Param('id') id: string) {
    return this.tenantService.deleteTenant(id);
  }
}
