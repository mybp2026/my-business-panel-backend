import { HttpException, HttpStatus } from '@nestjs/common';

export class CreateFullEmployeeError extends HttpException {
  constructor() {
    super(
      { error: 'Failed to create full employee. Check the request body' },
      HttpStatus.BAD_REQUEST,
    );
    this.name = 'CreateFullEmployeeError';
  }
}
