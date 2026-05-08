import { HttpException, HttpStatus } from '@nestjs/common';

export class RegisterIncapacityError extends HttpException {
  constructor(id: string) {
    super(
      { message: `Failed to register incapacity for employee with ID ${id}` },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    this.name = 'RegisterIncapacityError';
  }
}
