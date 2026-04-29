import { HttpException, HttpStatus } from '@nestjs/common';

export class UpdateMarginError extends HttpException {
  constructor() {
    super(
      { error: `Error updating margin` },
      HttpStatus.BAD_REQUEST,
    );

    this.name = 'UpdatingMarginError';
  }
}
