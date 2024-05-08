import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

import { models } from "../models/index.js";
import { AuthError, BadRequestError } from "../errors/index.js";
import { toTitleCase } from "../utils/toTitleCase.js";

const User = models.User;

/** POST `<apiRoot>`/auth/register
 * Create a user. An error is thrown if the user can't be successfully
 * created. The username can be at most 20 characters and can only
 * include letters, numbers, and the special characters "." and "_". A
 * "." cannot begin a username, but a "_" can. You cannot have > one
 * "." in sequence. A username cannot consist of only numbers or a
 * combination of allowed special characters (even if the rules for
 * the "." are followed).
 *
 * Body params: email, username, firstName, lastName, password
 *
 * Return: {
 *    "id": `<user id>`,
 *    "token": `<login token>`
 * }
 *
 * Success status code: 201
 *
 * DEV NOTE: Email and username are stored in lowercase.
 * Store names in title case?
 */
const register = asyncHandler(async (req, res) => {
  let { email, username, firstName, lastName, password } = req.body;
  email =
    email !== null && email !== undefined ? email.trim().toLowerCase() : email;
  username =
    username !== null && username !== undefined
      ? username.trim().toLowerCase()
      : username;
  firstName =
    firstName !== null && firstName !== undefined
      ? toTitleCase(firstName)
      : firstName;
  lastName =
    lastName !== null && lastName !== undefined
      ? toTitleCase(lastName)
      : lastName;
  const user = await User.create({
    email,
    username,
    firstName,
    lastName,
    password,
  });
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
