import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidContextError extends HttpException {
  constructor(resource: string, context?: string) {
    super(
      {
        error: `Resource with name ${resource} cannot be accessed by ${context ?? 'this context'} `,
      },
      HttpStatus.METHOD_NOT_ALLOWED,
    );
    this.name = 'InvalidContextErorr';
  }
}
