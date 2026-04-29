import { HttpException, HttpStatus } from "@nestjs/common";

export class PromotionCreationError extends HttpException {
  constructor() {
    super(
      { error: "Invalid promotion creation. Review the request body" },
      HttpStatus.UNPROCESSABLE_ENTITY,
    )
    this.name="PromotionCreationError"
  }
}