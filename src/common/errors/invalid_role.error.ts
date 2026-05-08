import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidRoleError extends HttpException {
  constructor(role: number) {
    super(
      { error: `role with id'${role}' doesn't exist.` },
      HttpStatus.UNAUTHORIZED,
    );
    this.name = 'InvalidRoleError';
  }
}
