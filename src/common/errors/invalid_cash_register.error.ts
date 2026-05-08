import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCashRegisterError extends HttpException {
  constructor(cash_register_id: string) {
    super(
      { error: `Cash register with id ${cash_register_id} doesn't exsists` },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    this.name = 'InvalidCashRegisterError';
  }
}
