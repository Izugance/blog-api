import { StatusCodes } from "http-status-codes";

import { BaseAPIError } from "./base.js";

export class BadRequestError extends BaseAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}
