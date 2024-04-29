import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

import { models } from "../models/index.js";
import { AuthError, BadRequestError } from "../errors/index.js";
import { toTitleCase } from "../utils/toTitleCase.js";

const User = models.User;

/** POST `<apiRoot>`/auth/register
 * Create a user. An error is thrown if the user can't be successfully
 * created.
 *
 * Body params: firstName, lastName, email, password
 *
 * Return: {
 *    "id": `<user id>`,
 *    "token": `<login token>`
 * }
 *
 * Success status code: 201
 *
 * DEV NOTE: Email is stored in lowercase. Store names in title case?
 */
const register = asyncHandler(async (req, res) => {
  let { firstName, lastName, email, password } = req.body;
  firstName = toTitleCase(firstName);
  lastName = toTitleCase(lastName);
  email = email.trim().toLowerCase();
  const user = await User.create({ firstName, lastName, email, password });
  const token = user.genJWT();
  res.status(StatusCodes.CREATED).json({ userId: user.id, token });
});

/** GET `<apiRoot>`/auth/login
 * Login a user. Return the logged-in user's id and login token.
 *
 * Body params: email, password
 *
 * Return: {
 *    "id": `<user id>`,
 *    "token": `<login token>`
 * }
 *
 * Success status code: 200
 */
const login = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  if (!(email && password)) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!(user && (await user.verifyPassword(password)))) {
    throw new AuthError("Invalid credentials");
  }
  const token = user.genJWT();
  res.status(StatusCodes.OK).json({ userId: user.id, token });
});

export { register, login };
