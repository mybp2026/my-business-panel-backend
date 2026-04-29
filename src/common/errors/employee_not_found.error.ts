import { HttpException, HttpStatus } from '@nestjs/common';

export class EmployeeNotFoundError extends HttpException {
  constructor(employeeId: string) {
    super(
      { error: `Employee with id ${employeeId} not found.` },
      HttpStatus.NOT_FOUND,
    );

    this.name = 'EmployeeNotFoundError';
  }
}
