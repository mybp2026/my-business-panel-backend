import { HttpException, HttpStatus } from '@nestjs/common';

export class CreateSuspentionError extends HttpException {
  constructor() {
    super(
      { message: 'Failed to create suspention' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    this.name = 'CreateSuspentionError';
  }
}
