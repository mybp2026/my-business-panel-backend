import { Body, Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';
import { CreateBranchDto } from '@/contexts/general/modules/branch/dto/create_branch.dto';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import {
  findBranchByIdDoc,
  findAllBranchesDoc,
  createBranchDoc,
} from '@/docs/contexts/general/branch';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

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
  findAll(@Session() session: IUserSession) {
    return this.branchService.findByTenant(session.tenant_id);
  }

  @ApiOperation(createBranchDoc.operation)
  @ApiResponse(createBranchDoc.responses[201])
  @ApiResponse(createBranchDoc.responses[400])
  @ApiResponse(createBranchDoc.responses[401])
  @Post('/')
  async createBranch(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.createBranch(
      createBranchDto.tenant_id,
      createBranchDto,
    );
  }
}
