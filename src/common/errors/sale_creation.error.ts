import { HttpException, HttpStatus } from '@nestjs/common';

export class SaleCreationError extends HttpException {
  constructor() {
    super(
      { message: 'Error Creating the Sale. Please Check the Request' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    this.name = 'SaleCreationError';
  }
}
