import express from "express";

import { userAuthMiddleware } from "../middleware/auth.js";
import {
  getCurrentUserProfile,
  getUserByUsername,
  getUserFollowing,
  getUserFollowers,
  getUserLikes,
  getUserArticles,
  followUser,
  unfollowUser,
} from "../controllers/user.js";

const userRouter = express.Router();

userRouter
  .route("/current-user/profile")
  .get(userAuthMiddleware, getCurrentUserProfile);
userRouter.route("/:username").get(getUserByUsername);
userRouter.route("/:username/articles").get(getUserArticles);
userRouter.route("/:userId/following").get(getUserFollowing);
userRouter
  .route("/:userId/followers")
  .get(getUserFollowers)
  .post(userAuthMiddleware, followUser)
  .delete(userAuthMiddleware, unfollowUser);
userRouter.route("/current-user/likes").get(userAuthMiddleware, getUserLikes);

export { userRouter };
