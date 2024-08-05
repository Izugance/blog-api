import { StatusCodes } from "http-status-codes";
export class BaseAPIError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}
