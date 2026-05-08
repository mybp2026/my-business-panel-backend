import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidBranchError extends HttpException {
  constructor(branchId?: string) {
    super(
      {
        error: branchId
          ? `Branch with id ${branchId} does not exists`
          : 'Error: Invalid branch provided.',
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    this.name = 'InvalidBranchError';
  }
}
