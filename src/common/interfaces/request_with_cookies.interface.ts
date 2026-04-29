import { Request } from '@nestjs/common';

export interface IRequestWithCookies extends Request {
  user: any;
  cookies: Record<string, string>;
}
