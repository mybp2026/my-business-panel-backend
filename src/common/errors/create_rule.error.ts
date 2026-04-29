import { HttpException, HttpStatus } from '@nestjs/common';

export class RuleCreationError extends HttpException {
  constructor() {
    super(
      { error: 'Theres no valid rule in the request' },
      HttpStatus.BAD_REQUEST,
    );
    this.name = 'RuleCreationError';
  }
}
