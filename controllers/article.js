import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

import { models } from "../models/index.js";
import { ResourceNotFoundError } from "../errors/index.js";
import { getOffset } from "../utils/pagination.js";

const Article = models.Article;
const Comment = models.Comment;
const Like = models.Like;
const User = models.User;
const PAGINATION_LIMIT = 16;

/** GET `<apiRoot>`/articles/
 *
 * Get all articles in the blog. A max of 16 articles is returned per
 * page.
 *
 * Query params: page (default=1)
 *
 * Return: [
 *    {
 *      "id": `<article id>`,
 *      "title": `<article title>`,
 *      "Author": {
 *          "id": `<article author id>`,
 *          "username": `<article author username>`,
 *      }
 *    },
 *    ...
 *  ]
 *
 * Success status code: 200
 *
 * DEV NOTE: Include article content in return?
 */
const getAllArticles = asyncHandler(async (req, res) => {
  // Add query supports for articles created in a particular date.
  // Send data to indicate next page, if any.
  const page = Number(req.query.page) || 1;
  const offset = getOffset(PAGINATION_LIMIT, page);
  let articles = await Article.findAll({
    offset,
    limit: PAGINATION_LIMIT,
    include: {
      model: User,
      as: "Author",
      attributes: ["id", "username"],
    },
  });
  articles = articles.map((article) => {
    return article.toJSON();
  });
  res.status(StatusCodes.OK).json({ articles });
});

/** POST `<apiRoot>`/articles/
 *
 * Create a new article. An error is returned if the article cannot
 * be successfully created.
 *
 * Body params: title, content
 *
 * Return: {"id": `<article id>`}
 *
 * Success status code: 201
 */
const createArticle = asyncHandler(async (req, res) => {
  const article = await Article.create({
    authorId: req.user.id,
    title: req.body.title,
    content: req.body.content,
  });
  res.status(StatusCodes.CREATED).json({ id: article.id });
});

/** GET `<apiRoot>`/articles/:articleId
 *
 * Get a single article. An error is thrown if the article does not
 * exist.
 *
 * URL params: articleId
 *
 * Return: {
 *    "id": `<article id>`,
 *    "title": `<article title>`,
 *    "content": `<article content>`,
 *    "createdAt": `<timestamp>`,
 *    "Author": {
 *        "id": `<article author id>`,
 *        "username": `<article author username>`,
 *    }
 * }
 *
 * Success status code: 200
 */
const getArticle = asyncHandler(async (req, res) => {
  const article = await Article.findByPk(req.params.articleId, {
    attributes: ["id", "title", "content", "createdAt"],
    include: {
      model: User,
      as: "Author",
      attributes: ["id", "username"],
    },
  });
  if (!article) {
    throw new ResourceNotFoundError(
      `Article with id '${req.params.articleId}' does not exist`
    );
  }
  res.status(StatusCodes.OK).json({ article });
});

/** PATCH `<apiRoot>`/articles/:articleId
 *
 * Update an article.
 *
 * URL params: articleId
 *
 * Body params: Any or all both of title, content
 *
 * Return: null
 *
 * Success status code: 204
 *
 * DEV NOTES: Error if article doesn't exist?
 */
const updateArticle = asyncHandler(async (req, res) => {
  const nAffectedRows = await Article.update(req.body, {
    // Should authorId be indexed?                                             ---------------
    where: {
      id: req.params.articleId,
      authorId: req.user.id,
    },
    fields: ["title", "content"],
    validate: true,
  });
  // Infer article's existence from the number of affected rows.
  if (!nAffectedRows) {
    throw new ResourceNotFoundError(
      `Article with id '${req.params.articleId}' does not exist for user ${
        req.user.id || "anonymous"
      }`
    );
  }
  res.status(StatusCodes.NO_CONTENT).json(null);
});

/** DELETE `<apiRoot>`/articles/:articleId
 *
 * Delete an article.
 *
 * URL params: articleId
 *
 * Return: null
 *
 * Success status code: 204
 *
 * DEV NOTES: Error if article doesn't exist?
 */
const deleteArticle = asyncHandler(async (req, res) => {
  const nDeletedRows = await Article.destroy({
    where: {
      id: req.params.articleId,
      authorId: req.user.id,
    },
  });
  // Infer article's existence from the number of deleted rows.
  if (!nDeletedRows) {
    throw new ResourceNotFoundError(
      `Article with id '${req.params.articleId}' does not exist for user '${
        req.user.id || "anonymous"
      }'`
    );
  }
  res.status(StatusCodes.NO_CONTENT).json(null);
});

/** CREATE `<apiRoot>`/articles/:articleId/likes
 *
 * Like an article.
 *
 * URL params: articleId
 *
 * Return: null
 *
 * Success status code: 201
 *
 * DEV NOTES: Error if article doesn't exist?
 */
const likeArticle = asyncHandler(async (req, res) => {
  await Like.create({
    articleId: req.params.articleId, // INDEX ----------------------------------------------
    userId: req.user.id,
  });
  res.status(StatusCodes.CREATED).json(null);
});

/** DELETE `<apiRoot>`/articles/:articleId/likes
 *
 * Unlike an article.
 *
 * URL params: articleId
 *
 * Return: null
 *
 * Success status code: 204
 *
 * DEV NOTES: Error if article doesn't exist?
 */
const unlikeArticle = asyncHandler(async (req, res) => {
  const nDeletedRows = await Article.destroy({
    where: {
      articleId: req.params.articleId, // INDEX -----------------------------------------
      userId: req.user.id,
    },
  });
  // Infer article/like existence from the number of deleted rows.
  if (!nDeletedRows) {
    throw new ResourceNotFoundError(
      ```Article with id '${req.params.articleId}' does not exist or user
      '${req.user.id}' hasn't liked it
      ```
    );
  }
  res.status(StatusCodes.NO_CONTENT).json(null);
});

/** GET `<apiRoot>`/article/:articleId/comments
 *
 * Get an article's comments. A max of 16 comments is returned per
 * page.
 *
 * URL params: articleId
 *
 * Return: [
 *    {
 *      "id": `<comment id>`,
 *      "content": `<comment content>`,
 *      "createdAt": `<comment creation datetime>`,
 *      "Author": {
 *          "id": `<comment author id>`,
 *          "username": `<comment author username>`
 *      }
 *    },
 *    ...
 * ]
 *
 * Success status code: 200
 *
 * DEV NOTES: Paginate? Select only fields in return. Error if article
 * doesn't exist? Order?
 */
const getArticleComments = asyncHandler(async (req, res) => {
  // Using lazy loading.
  const page = req.query.page || 1;
  const article = await Article.findByPk(req.params.articleId);
  if (!article) {
    throw new ResourceNotFoundError(
      `Article with id '${req.params.articleId}' does not exist`
    );
  }
  const offset = getOffset(PAGINATION_LIMIT, page);
  let comments = await article.getComments({
    limit: PAGINATION_LIMIT,
    offset: offset,
    attributes: ["id", "content", "createdAt"],
    include: {
      model: User,
      as: "Author",
      attributes: ["id", "username"],
    },
  });
  comments = comments.map((comment) => {
    return comment.toJSON();
  });
  res.status(StatusCodes.OK).json({ comments });
});

/** POST <apiRoot>/articles/:articleId/comments
 *
 * Create a comment for an article.
 *
 * URL params: articleId
 *
 * Body params: content
 *
 * Return: [
 *    {"id": `<comment id>`}
 * ]
 *
 * Success status code: 200
 *
 * DEV NOTES: Error if article doesn't exist?
 */
const createArticleComment = asyncHandler(async (req, res) => {
  const article = await Article.findByPk(req.params.articleId);
  if (!article) {
    throw new ResourceNotFoundError(
      `Article with id '${req.params.articleId}' does not exist`
    );
  }
  // YOUR ERROR HANDLER MIDDLEWARE SHOULD BE ABLE TO HANDLE CREATION ERRORS ----------------------------
  const comment = await Comment.create({
    articleId: req.params.articleId,
    authorId: req.user.id,
    content: req.body.content,
  });
  res.status(StatusCodes.CREATED).json({ id: comment.id });
});

export {
  getAllArticles,
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  unlikeArticle,
  getArticleComments,
  createArticleComment,
};
