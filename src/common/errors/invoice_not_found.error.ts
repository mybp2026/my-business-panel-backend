import { HttpException, HttpStatus } from '@nestjs/common';

export class InvoiceNotFound extends HttpException {
  constructor() {
    super(
      { error: 'Invoice not found for the given sale.' },
      HttpStatus.NOT_FOUND,
    );
    this.name = 'InvoiceNotFoundError';
  }
}
