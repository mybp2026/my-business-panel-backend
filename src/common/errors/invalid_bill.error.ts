import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidInvoice extends HttpException {
  constructor() {
    super(
      { error: 'Error creating invoice on db.' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    this.name = 'InvalidInvoiceError';
  }
}
