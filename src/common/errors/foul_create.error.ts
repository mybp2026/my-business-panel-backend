import { HttpException, HttpStatus } from '@nestjs/common';

export class CreateFoulError extends HttpException {
  constructor() {
    super(
      { message: 'Failed to create foul. Please check the request body.' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    this.name = 'CreateFoulError';
  }
}
