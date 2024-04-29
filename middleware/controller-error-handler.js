import { StatusCodes } from "http-status-codes";

export default (err, req, res, next) => {
  const error = {
    msg:
      err.msg || "Something went wrong. Please check parameters and try again",
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  };

  if (err.name === "ValidationError") {
    let errorString = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
    error.msg = errorString;
    error.statusCode = StatusCodes.BAD_REQUEST;
  } else if (err.name === "CastError") {
    error.msg =
      `Could not find the requested resource with id ${err.value}. ` +
      "Please verify the id and try again";
    error.statusCode = StatusCodes.NOT_FOUND;
  } else if (err.code === 11000) {
    // Duplicate object creation error.
    error.msg =
      `Attempt at creating duplicate objects with unique ` +
      `field(s) '${Object.keys(err.keyValue)}'`;
    error.statusCode = StatusCodes.BAD_REQUEST;
  }

  return res.status(error.statusCode).json({ msg: error.msg });
};
