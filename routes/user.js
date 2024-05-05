import express from "express";

import { userAuthMiddleware } from "../middleware/auth.js";
import {
  getUserByEmail,
  getUserFollowing,
  getUserFollowers,
  getUserLikes,
  getUserArticles,
  followUser,
  unfollowUser,
} from "../controllers/user.js";

const userRouter = express.Router();

userRouter.route("/:email").get(getUserByEmail);
userRouter.route("/:userId/articles").get(getUserArticles);
userRouter.route("/:userId/following").get(getUserFollowing);
userRouter
  .route("/:userId/followers")
  .get(getUserFollowers)
  .post(userAuthMiddleware, followUser)
  .delete(userAuthMiddleware, unfollowUser);
userRouter.route("/current-user/likes").get(userAuthMiddleware, getUserLikes);

export { userRouter };
