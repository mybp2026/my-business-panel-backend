import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCashRegisterSessionError extends HttpException {
  constructor() {
    super(
      { error: `Invalid cash register session` },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    this.name = 'InvalidCashRegisterSessionError';
  }
}
