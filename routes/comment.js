import express from "express";

import { userAuthMiddleware } from "../middleware/auth.js";
import {
  getCommentComments,
  createCommentComment,
  getComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from "../controllers/comment.js";

const commentRouter = express.Router();

commentRouter
  .route("/:commentId")
  .get(getComment)
  .delete(userAuthMiddleware, deleteComment);

commentRouter
  .route("/:commentId/comments")
  .get(getCommentComments)
  .post(userAuthMiddleware, createCommentComment);

commentRouter
  .route("/:commentId/likes")
  .post(userAuthMiddleware, likeComment)
  .delete(userAuthMiddleware, unlikeComment);

export { commentRouter };
