import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '@/contexts/general/modules/user/user.service';
import { CreateUserDto } from '@/contexts/general/modules/user/dto/create_user.dto';
import { AssignRoleDto } from '@/contexts/general/modules/user/dto/assign_role.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';
import { CreateUserBulkDto } from '@/contexts/general/modules/user/dto/create_user_bulk.dto';
import {
  createUserDoc,
  createUsersBulkDoc,
  assignRoleDoc,
  getUserRolesDoc,
  getSelfInfoDoc,
  getUserByEmailDoc,
} from '@/docs/contexts/general/user';

// @UseGuards(AuthenticationGuard, LevelAuthorizationGuard, RoleAuthorizationGuard)
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation(createUserDoc.operation)
  @ApiResponse(createUserDoc.responses[201])
  @ApiResponse(createUserDoc.responses[400])
  @ApiResponse(createUserDoc.responses[401])
  @Post()
  @RequiredLevel(3)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @ApiOperation(createUsersBulkDoc.operation)
  @ApiResponse(createUsersBulkDoc.responses[201])
  @ApiResponse(createUsersBulkDoc.responses[400])
  @ApiResponse(createUsersBulkDoc.responses[401])
  @Post('bulk')
  @RequiredLevel(3)
  async createUsersBulk(@Body() createUserDtos: CreateUserBulkDto) {
    return this.userService.createUsersBulk(createUserDtos.users);
  }

  @ApiOperation(assignRoleDoc.operation)
  @ApiResponse(assignRoleDoc.responses[200])
  @ApiResponse(assignRoleDoc.responses[401])
  @Put()
  @RequiredLevel(3)
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.userService.assignRole(assignRoleDto);
  }

  @ApiOperation(getUserRolesDoc.operation)
  @ApiResponse(getUserRolesDoc.responses[200])
  @ApiResponse(getUserRolesDoc.responses[401])
  @Get('roles')
  @RequiredLevel(4)
  getUserRoles() {
    return this.userService.getUserRoles();
  }

  @ApiOperation(getSelfInfoDoc.operation)
  @ApiResponse(getSelfInfoDoc.responses[200])
  @ApiResponse(getSelfInfoDoc.responses[401])
  @Get()
  @UseGuards(AuthenticationGuard)
  getSelfInfo(@Session() session: IUserSession) {
    return this.userService.getSelfInfo(session);
  }

  @ApiOperation(getUserByEmailDoc.operation)
  @ApiResponse(getUserByEmailDoc.responses[200])
  @ApiResponse(getUserByEmailDoc.responses[401])
  @ApiResponse(getUserByEmailDoc.responses[404])
  @RequiredLevel(3)
  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }
}
