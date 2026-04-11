import { Body, Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';
import { CreateBranchDto } from '@/contexts/general/modules/branch/dto/create_branch.dto';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get('/:id')
  @UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
  @RequiredLevel(2)
  findById(@Param('id') id: string) {
    return this.branchService.findById(id);
  }

  @Get('/')
  @UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
  @RequiredLevel(2)
  findAll(@Session() session: IUserSession) {
    return this.branchService.findByTenant(session.tenant_id);
  }

  @Post('/')
  async createBranch(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.createBranch(createBranchDto.tenant_id, createBranchDto);
  }
}
