import { StatusCodes } from "http-status-codes";
export class BaseAPIError {
  constructor(msg) {
    this.msg = msg;
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}
