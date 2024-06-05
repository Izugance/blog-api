import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

import { models, sequelize } from "../models/index.js";
import { ResourceNotFoundError } from "../errors/index.js";
import { getOffset } from "../utils/pagination.js";
import { ValidationError } from "sequelize";

const Comment = models.Comment;
const Article = models.Article;
const User = models.User;
const Like = models.Like;
const PAGINATION_LIMIT = 16;

/** GET `<apiRoot>`/comments/:commentId/comments
 *
 * Get a comment's comments. A max of 16 comments is returned per
 * request.
 *
 * URL params: articleId
 *
 * Return: [
 *    {
 *      "id": `<comment id>`,
 *      "content": `<comment content>`,
 *      "createdAt": `<comment creation datetime>`,
 *      "nComments": `<comment comment count>`,
 *      "nLikes": `<comment like count>`,
 *      "Author": {
 *          "id": `<comment author id>`,
 *          "username": `<comment author username>`
 *       }
 *    },
 *    ...
 * ]
 *
 * Success status code: 200
 *
 * DEV NOTES: Paginate? Select only fields in return. Error if article
 * doesn't exist?
 */
const getCommentComments = asyncHandler(async (req, res) => {
  // Using lazy loading.
  const comment = await Comment.findByPk(req.params.commentId, {
    attributes: ["id"],
  });
  if (!comment)
    throw new ResourceNotFoundError(
      `Comment with id ${req.params.commentId} does not exist`
    );

  const page = req.query.page || 1;
  const offset = getOffset(PAGINATION_LIMIT, page);
  let comments = await comment.getComments({
    limit: PAGINATION_LIMIT,
    offset: offset,
    attributes: ["id", "content", "createdAt", "nComments", "nLikes"],
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

/** POST `<apiRoot>`/comments/:commentId/comments
 *
 * Create a comment for a comment.
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
 * DEV NOTES: Error if comment exists?
 */
const createCommentComment = asyncHandler(async (req, res) => {
  const parentComment = await Comment.findByPk(req.params.articleId, {
    attributes: ["id", "nComments"],
  });
  if (!parentComment) {
    throw new ResourceNotFoundError(
      `Comment with id '${req.params.commentId}' does not exist`
    );
  }

  const comment = await sequelize.transaction(async (t) => {
    const comment = await Comment.create({
      authorId: req.user.id,
      parentCommentId: req.params.commentId,
      content: req.body.content,
    });

    await Comment.increment(
      "nComments",
      { where: { id: req.params.commentId }, by: 1, returning: false },
      { transaction: t }
    );
    await User.increment(
      "nComments",
      { where: { id: req.user.id }, by: 1, returning: false },
      { transaction: t }
    );
    return comment;
  });

  res.status(StatusCodes.CREATED).json({ id: comment.id });
});

/** GET `<apiRoot>`/comments/:commentId
 *
 * Get a single comment. An error is thrown if the comment doesn't
 * exist. An article attached to a parent post (article or comment)
 * has the corresponding value (`articleId` or `parentCommentId`)
 * not null. A comment with a deleted parent post has both `articleId`
 * and `parentCommentId` being null.
 *
 * URL params: commentId
 *
 * Return: {
 *    "id": `<comment id>`,
 *    "articleId": `<article id>`,
 *    "parentCommentId": `<parent comment id>`
 *    "content": `<comment content>`,
 *    "createdAt": `<comment creation datetime>`,
 *    "nComments": `<comment comment count>`,
 *    "nLikes": `<comment like count>`,
 *    "Author": {
 *        "id": `<comment author id>`,
 *        "username": `<comment author username>`
 *    }
 * }
 *
 * Success status code: 200
 */
const getComment = asyncHandler(async (req, res) => {
  let comment = await Comment.findByPk(req.params.commentId, {
    attributes: [
      "id",
      "articleId",
      "parentCommentId",
      "content",
      "createdAt",
      "nComments",
      "nLikes",
    ],
    include: {
      model: User,
      as: "Author",
      attributes: ["id", "username"],
    },
  });

  if (!comment) {
    throw new ResourceNotFoundError(
      `Comment with id ${req.params.commentId} does not exist`
    );
  }
  comment = comment.toJSON();
  res.status(StatusCodes.OK).json({ comment });
});

/** DELETE `<apiRoot>`/comments/:commentId
 *
 * Delete a single comment. An error is thrown if the comment doesn't
 * exist.
 *
 * URL params: commentId
 *
 * Return: null
 *
 * Success status code: 204
 */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findByPk(req.params.commentId, {
    attributes: ["id", "articleId", "parentCommentId"],
  });
  if (!comment) {
    throw new ResourceNotFoundError(
      `Comment with id ${req.params.commentId} does not exist for user ${
        req.user.id || "anonymous"
      }`
    );
  }

  await sequelize.transaction(async (t) => {
    await comment.destroy();
    if (comment.articleId) {
      await Article.decrement(
        "nComments",
        { where: { id: comment.articleId }, by: 1, returning: false },
        { transaction: t }
      );
    } else {
      await Comment.decrement(
        "nComments",
        { where: { id: comment.parentCommentId }, by: 1, returning: false },
        { transaction: t }
      );
    }

    await User.decrement(
      "nComments",
      { where: { id: req.user.id }, by: 1, returning: false },
      { transaction: t }
    );
  });

  res.status(StatusCodes.NO_CONTENT).json(null);
});

/** GET `<apiRoot>`/articles/:articleId/likes
 *
 * Get users that have liked a comment.
 *
 * URL params: articleId
 *
 * Return: [
 *    {
 *      "User": {
 *          "id": `<user id>`,
 *          "username": `<user username>`
 *      }
 *    },
 *    ...
 * ]
 *
 * Success status code: 200
 *
 * DEV NOTES: Error if comment doesn't exist? Include count?
 */
const getCommentLikes = asyncHandler(async (req, res) => {
  const comment = await Comment.findByPk(req.params.commentId, {
    attributes: ["id"],
  });
  if (!comment) {
    throw new ResourceNotFoundError(
      `Comment with id '${req.params.commentId}' does not exist`
    );
  }

  const page = req.query.page || 1;
  const offset = getOffset(PAGINATION_LIMIT, page);
  let likes = await Like.findAll({
    where: { commentId: req.params.commentId },
    offset,
    limit: PAGINATION_LIMIT,
    attributes: [],
    include: {
      model: User,
      attributes: ["id", "username"],
    },
  });

  likes = likes.map((like) => {
    return like.toJSON();
  });
  res.status(StatusCodes.CREATED).json({ likes });
});

/** CREATE `<apiRoot>`/comments/:commentId/likes
 *
 * Like a comment.
 *
 * URL params: commentId
 *
 * Body params: content
 *
 * Return: null
 *
 * Success status code: 201
 *
 * DEV NOTES: Error if comment doesn't exist? Handled by fkey
 * constraint.
 */
const likeComment = asyncHandler(async (req, res) => {
  const like = await Like.findOne({
    where: { userId: req.user.id, commentId: req.params.commentId },
    attributes: ["id"],
  });
  if (like) {
    throw new ValidationError("Attempt at creating duplicate Likes");
  }

  await sequelize.transaction(async (t) => {
    await Like.create({
      commentId: req.params.commentId,
      userId: req.user.id,
    });

    await Comment.increment(
      "nLikes",
      {
        where: { id: req.params.commentId },
        by: 1,
        returning: false,
      },
      { transaction: t }
    );
    await User.increment(
      "nLikes",
      {
        where: { id: req.user.id },
        by: 1,
        returning: false,
      },
      { transaction: t }
    );
  });

  res.status(StatusCodes.CREATED).json(null);
});

/** DELETE `<apiRoot>`/comments/:commentId/likes
 *
 * Unlike a comment.
 *
 * URL params: commentId
 *
 * Body params: content
 *
 * Return: null
 *
 * Success status code: 204
 *
 * DEV NOTES: Error if comment doesn't exist?
 */
const unlikeComment = asyncHandler(async (req, res) => {
  await sequelize.transaction(async (t) => {
    const nDeletedRows = await Like.destroy({
      where: {
        commentId: req.params.commentId, // ----------------------------------- INDEX.
        userId: req.user.id,
      },
    });
    // Infer comment/like existence from the number of deleted rows.
    if (!nDeletedRows) {
      throw new ResourceNotFoundError(
        `Comment with id '${req.params.commentId}' does not exist or user
        '${req.user.id}' hasn't liked it
        `
      );
    }

    await Comment.decrement(
      "nLikes",
      {
        where: { id: req.params.commentId },
        by: 1,
        returning: false,
      },
      { transaction: t }
    );
    await User.decrement(
      "nLikes",
      {
        where: { id: req.user.id },
        by: 1,
        returning: false,
      },
      { transaction: t }
    );
  });

  res.status(StatusCodes.NO_CONTENT).json(null);
});

export {
  getCommentComments,
  createCommentComment,
  getComment,
  deleteComment,
  getCommentLikes,
  likeComment,
  unlikeComment,
};
