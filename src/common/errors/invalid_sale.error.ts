import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidSale extends HttpException {
  constructor(saleId: string) {
    super(
      { error: `Error creating sale with id ${saleId}.` },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    this.name = 'InvalidSaleError';
  }
}
