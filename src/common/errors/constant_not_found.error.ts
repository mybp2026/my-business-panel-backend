import { HttpException, HttpStatus } from '@nestjs/common';

export class ConstantNotFoundError extends HttpException {
  constructor(constantName?: string) {
    console.error(
      `ConstantNotFoundError: Error getting ${constantName} constant`,
    );
    super(
      {
        error: `Error processing this request`,
        details: `Error finding constant ${constantName ? `: '${constantName}'` : ''} `,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    this.name = 'ConstantNotFoundError';
    // * Optional: Log the missing constant name for debugging purposes
  }
}
