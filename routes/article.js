import express from "express";

import { userAuthMiddleware } from "../middleware/auth.js";
import {
  getAllArticles,
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  unlikeArticle,
  getArticleComments,
  createArticleComment,
} from "../controllers/article.js";

const articleRouter = express.Router();

articleRouter
  .route("/")
  .get(getAllArticles)
  .post(userAuthMiddleware, createArticle);

articleRouter
  .route("/:articleId")
  .get(getArticle)
  .patch(userAuthMiddleware, updateArticle)
  .delete(userAuthMiddleware, deleteArticle);

articleRouter
  .route("/:articleId/comments")
  .get(getArticleComments)
  .post(userAuthMiddleware, createArticleComment);

articleRouter
  .route("/:articleId/likes")
  .post(userAuthMiddleware, likeArticle)
  .delete(userAuthMiddleware, unlikeArticle);

export { articleRouter };
