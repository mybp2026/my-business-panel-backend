/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestWithCookies } from '../interfaces/request_with_cookies.interface';
import { IUserSession } from '../interfaces/user_session.interface';
import { InvalidContextError } from '@/common/errors/invalid_context.error';
import { InvalidSessionError } from '@/common/errors/invalid_session.error';

export const Session = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const contextType = ctx.getType<'http' | 'rpc' | 'ws'>();
    if (contextType !== 'http')
      throw new InvalidContextError('Session Decorator', contextType);

    const request = ctx.switchToHttp().getRequest() as IRequestWithCookies;
    if (!request.user) {
      throw new InvalidSessionError();
    }
    return request.user as IUserSession;
  },
);
