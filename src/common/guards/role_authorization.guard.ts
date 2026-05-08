import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/common/decorators/role_metadata.decorator';
import { StateService } from '@/contexts/general/modules/state/state.service';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { InvalidSessionError } from '@/common/errors/invalid_session.error';
import { IRequestWithCookies } from '../interfaces/request_with_cookies.interface';

@Injectable()
export class RoleAuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly stateService: StateService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const validRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!validRoles) return true;

    const request: IRequestWithCookies = context.switchToHttp().getRequest();
    const user: IUserSession = request.user;
    if (!user) throw new InvalidSessionError('INVALID');

    const userRole = this.stateService.getRole(user.role_id);
    const validAccess = validRoles.some((role) => role === userRole.role_name);
    if (!validAccess) throw new InvalidSessionError('UNAUTHORIZED');
    return true;
  }
}
