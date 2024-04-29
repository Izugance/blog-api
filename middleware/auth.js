import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { AuthError } from "../errors/auth.js";

const verifyAuthHeader = (header, secret) => {
  if (!(header && header.startsWith("Bearer"))) {
    throw new AuthError("Invalid auth header");
  }
  const token = header.split(" ")[1];
  try {
    let payload = jwt.verify(token, secret);
    return { payload, token };
  } catch (err) {
    throw new AuthError("Invalid auth token");
  }
};

const userAuthMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("authorization");
  let { payload, token } = verifyAuthHeader(authHeader, process.env.JWT_SECRET);
  req.user = { id: payload.userId, email: payload.email, token };
  next();
});

export { userAuthMiddleware };
