import { HttpException, HttpStatus } from '@nestjs/common';

export class VerifyPaymentException extends HttpException {
  constructor(paymentId: string) {
    super(
      { error: `Payment verification failed for payment ID: ${paymentId}` },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    this.name = 'VerifyPaymentException';
  }
}
