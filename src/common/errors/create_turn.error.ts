import { HttpException, HttpStatus } from '@nestjs/common';

export class CreateTurnError extends HttpException {
  constructor() {
    super(
      { message: 'Failed to create new turn. Check the request.' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    this.name = 'CreateTurnError';
  }
}
