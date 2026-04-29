import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidTenantError extends HttpException {
  constructor(tenant: string) {
    super(
      { error: `tenant with uuid '${tenant}' doesn't exist.` },
      HttpStatus.UNAUTHORIZED,
    );
    this.name = 'InvalidTenantError';
  }
}
