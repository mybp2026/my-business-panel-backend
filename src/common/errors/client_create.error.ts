import { HttpException, HttpStatus } from "@nestjs/common";

export class ClientCreateError extends HttpException{
  constructor(email: string) {
    super(
      { error: `Error creating client with email: ${email}` },
      HttpStatus.UNPROCESSABLE_ENTITY,
    )

    this.name = "ClientCreationError"
  }
}