import { StatusCodes } from "http-status-codes";

import { BaseAPIError } from "./base.js";

export class AuthError extends BaseAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}
