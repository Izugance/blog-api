import { StatusCodes } from "http-status-codes";

export default (req, res, next) => {
  return res.status(StatusCodes.NOT_FOUND).json({
    message:
      "Requested endpoint does not exist. Check that you're using the " +
      "required method and that you've not mispelled the URL",
  });
};
