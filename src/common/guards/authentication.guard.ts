/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IRequestWithCookies } from '@/common/interfaces/request_with_cookies.interface';
import { StateService } from '@/contexts/general/modules/state/state.service';
import { InvalidSessionError } from '@/common/errors/invalid_session.error';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly stateService: StateService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as IRequestWithCookies;
    const token = request.cookies['auth_token'];

    if (!token) throw new InvalidSessionError();
    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.stateService.getConstant<string>('JWT_SECRET'),
      });
      const decodedToken = this.jwtService.decode(token);
      if (decodedToken && typeof decodedToken === 'object')
        request.user = decodedToken;
      else throw new Error();

      return true;
    } catch {
      console.error('Access denied: invalid or expired token');
      throw new InvalidSessionError('UNAUTHORIZED');
    }
  }
}
