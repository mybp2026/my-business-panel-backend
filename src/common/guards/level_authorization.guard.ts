import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LEVELS_KEY } from '@/common/decorators/level_metadata.decorator';
import { StateService } from '@/contexts/general/modules/state/state.service';
import { IUserSession } from '../interfaces/user_session.interface';
import { InvalidSessionError } from '../errors/invalid_session.error';

@Injectable()
export class LevelAuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly stateService: StateService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const minimumLevel = this.reflector.getAllAndOverride<number>(LEVELS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!minimumLevel) return true;

    const user: IUserSession = context.switchToHttp().getRequest().user;
    if (!user) {
      console.error('Access denied: no user in session');
      throw new InvalidSessionError('INVALID');
    }

    const userRole = this.stateService.getRole(user.role_id);
    const validAccess = userRole.role_hierarchy >= minimumLevel;
    if (!validAccess) {
      console.error(
        `Access denied: required level ${minimumLevel}, user level ${userRole.role_hierarchy}`,
      );
      throw new InvalidSessionError('UNAUTHORIZED');
    }
    return true;
  }
}
