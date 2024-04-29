import express from "express";

import { register, login } from "../controllers/auth.js";
const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.get("/login", login);

export { authRouter };
