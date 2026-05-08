import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'ROLES';

export const RequiredRole = (...rolesWithAccess: string[]) =>
  SetMetadata(ROLES_KEY, rolesWithAccess);
