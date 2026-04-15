import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';
import { CreateBranchDto } from '@/contexts/general/modules/branch/dto/create_branch.dto';
import { UpdateBranchDto } from '@/contexts/general/modules/branch/dto/update_branch.dto';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { StateService } from '@/contexts/general/modules/state/state.service';
import {
  findBranchByIdDoc,
  findAllBranchesDoc,
  createBranchDoc,
} from '@/docs/contexts/general/branch';

const SUPERUSER_HIERARCHY = 1;

@ApiTags('Branch')
@Controller('branch')
export class BranchController {
  constructor(
    private readonly branchService: BranchService,
    private readonly stateService: StateService,
  ) {}

  @ApiOperation(findBranchByIdDoc.operation)
  @ApiResponse(findBranchByIdDoc.responses[200])
  @ApiResponse(findBranchByIdDoc.responses[401])
  @ApiResponse(findBranchByIdDoc.responses[404])
  @Get('/:id')
  @UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
  @RequiredLevel(2)
  findById(@Param('id') id: string) {
    return this.branchService.findById(id);
  }

  @ApiOperation(findAllBranchesDoc.operation)
  @ApiResponse(findAllBranchesDoc.responses[200])
  @ApiResponse(findAllBranchesDoc.responses[401])
  @Get('/')
  @UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
  @RequiredLevel(2)
  async findAll(
    @Session() session: IUserSession,
    @Query('page') page = '1',
    @Query('limit') limit = '100',
  ) {
    const userRole = this.stateService.getRole(session.role_id);
    if (userRole.role_hierarchy === SUPERUSER_HIERARCHY) {
      return this.branchService.findAllGlobal(parseInt(page), parseInt(limit));
    }
    return this.branchService.findByTenantPaginated(
      session.tenant_id,
      parseInt(page),
      parseInt(limit),
    );
  }

  // Explicit tenant endpoint (for frontend filtering by tenant)
  @Get('/tenant/:tenantId')
  @UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
  @RequiredLevel(2)
  async findByTenant(
    @Param('tenantId') tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '100',
  ) {
    return this.branchService.findByTenantPaginated(
      tenantId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @ApiOperation(createBranchDoc.operation)
  @ApiResponse(createBranchDoc.responses[201])
  @ApiResponse(createBranchDoc.responses[400])
  @ApiResponse(createBranchDoc.responses[401])
  @Post('/')
  async createBranch(
    @Body() createBranchDto: CreateBranchDto,
    @Session() session: IUserSession,
  ) {
    const userRole = this.stateService.getRole(session.role_id);
    // Superusers can create branches for any tenant
    const tenantId =
      userRole.role_hierarchy === SUPERUSER_HIERARCHY
        ? createBranchDto.tenant_id
        : session.tenant_id;
    return this.branchService.createBranch(tenantId, createBranchDto);
  }

  @Delete('/:id')
  @UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
  @RequiredLevel(2)
  async deleteBranch(@Param('id') id: string) {
    return this.branchService.deleteBranch(id);
  }

  @Patch('/:id')
  @UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
  @RequiredLevel(2)
  async updateBranch(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return this.branchService.updateBranch(id, updateBranchDto);
  }
}
