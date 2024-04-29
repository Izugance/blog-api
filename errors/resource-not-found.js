import { StatusCodes } from "http-status-codes";

import { BaseAPIError } from "./base.js";

export class ResourceNotFoundError extends BaseAPIError {
  constructor(msg) {
    super(msg);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}
