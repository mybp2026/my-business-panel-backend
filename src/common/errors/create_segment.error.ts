import { HttpException, HttpStatus } from '@nestjs/common';

export class CreateSegmentError extends HttpException {
  constructor() {
    super({ error: 'Failed to create segment' }, HttpStatus.BAD_REQUEST);

    this.name = 'CreateSegmentError';
  }
}
