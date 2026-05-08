import { HttpException, HttpStatus } from '@nestjs/common';

type ErrorType = 'INVALID' | 'UNAUTHORIZED';

export class InvalidSessionError extends HttpException {
  constructor(errorType: ErrorType = 'UNAUTHORIZED') {
    switch (errorType) {
      case 'INVALID':
        super({ error: `Session is invalid` }, HttpStatus.UNAUTHORIZED);
        break;
      case 'UNAUTHORIZED':
        super(
          { error: `User is not authorized to perform this operation` },
          HttpStatus.UNAUTHORIZED,
        );
        break;
      default:
        super({ error: `Session is unauthorized` }, HttpStatus.UNAUTHORIZED);
    }
    this.name = 'InvalidSessionError';
  }
}
