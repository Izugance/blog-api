import { StatusCodes } from "http-status-codes";

import { BaseAPIError } from "./base.js";

export class BadRequestError extends BaseAPIError {
  constructor(msg) {
    super(msg);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}
