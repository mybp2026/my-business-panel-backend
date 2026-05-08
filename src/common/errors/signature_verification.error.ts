import { HttpException, HttpStatus } from '@nestjs/common';

export class SignatureVerificationError extends HttpException {
  constructor(msg: string) {
    super(
      {
        error: 'Signature verification failed: ' + msg,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    this.name = 'SignatureVerificationError';
  }
}
