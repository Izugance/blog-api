import { StatusCodes } from "http-status-codes";
import { ValidationError } from "sequelize";

import { toTitleCase } from "../utils/toTitleCase.js";

export default (err, req, res, next) => {
  const error = {
    msg:
      err.msg || "Something went wrong. Please check arguments and try again",
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  };

  if (err.name === "SequelizeUniqueConstraintError") {
    error.msg = `Attempt at creating duplicate ${err.parent.table}`;
    error.statusCode = StatusCodes.BAD_REQUEST;
  } else if (err.name === "SequelizeForeignKeyConstraintError") {
    const fkey = err.parent.constraint.split("_")[1];
    const model = toTitleCase(fkey.slice(0, -2));
    error.msg = `${model} with provided id doesn't exist`;
    error.statusCode = StatusCodes.NOT_FOUND;
  } else if (err instanceof ValidationError) {
    const errorFields = err.errors.map((errorItem) => {
      return errorItem.path;
    });
    error.msg = `Invalid arguments. Fields: '${errorFields.join(", ")}'`;
    error.statusCode = StatusCodes.BAD_REQUEST;
  }

  return res.status(error.statusCode).json({ msg: error.msg });
};
