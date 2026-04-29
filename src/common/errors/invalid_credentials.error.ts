import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsError extends HttpException {
  constructor() {
    super(
      { error: `Provided credentials are invalid` },
      HttpStatus.UNAUTHORIZED,
    );
    this.name = 'InvalidCredentialsError';
  }
}
