import { HttpException, HttpStatus } from '@nestjs/common';

export class UserCreationError extends HttpException {
  constructor(username: string) {
    super(
      { error: `Error creating user with email '${username}' ` },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    this.name = 'UserCreationError';
  }
}
