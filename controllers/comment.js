import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

import { models } from "../models/index.js";
import { ResourceNotFoundError } from "../errors/index.js";
import { getOffset } from "../utils/pagination.js";

const Comment = models.Comment;
const Like = models.Like;
const PAGINATION_LIMIT = 16;

/** GET `<apiRoot>`/comments/:commentId/comments
 *
 * Get a comment's comments. A max of 16 comments is returned per
 * page.
 *
 * URL params: articleId
 *
 * Return: [
 *    {
 *      "id": `<comment id>`,
 *      "authorId": `<comment author id>`,
 *      "content": `<comment content>`
 *    }
 * ]
 *
 * Success status code: 200
 *
 * DEV NOTES: Paginate? Select only fields in return. Error if article
 * doesn't exist?
 */
const getCommentComments = asyncHandler(async (req, res) => {
  // const comment = await Comment.findById(req.params.commentId)
  //   .select("comments")
  //   .exec();
  // Using lazy loading.
  const comment = await Comment.findById(req.params.commentId);

  if (!comment)
    throw new ResourceNotFoundError(
      `Comment with id ${req.params.commentId} does not exist`
    );

  const page = req.query.page || 1;
  const offset = getOffset(PAGINATION_LIMIT, page);
  let comments = comment.getComments({
    limit: PAGINATION_LIMIT,
    offset: offset,
    attributes: ["id", "authorId", "content", "createdAt"],
  });
  // comments = comments.map((comment) => {
  //   return comment.toJSON();
  // });
  comments = comments.toJSON();
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
 * DEV NOTES: Error if comment doesn't exist?
 */
const createCommentComment = asyncHandler(async (req, res) => {
  const comment = await Comment.create({
    authorId: req.user.id,
    commentId: req.params.commentId,
    content: req.body.content,
  });
  res.status(StatusCodes.CREATED).json({ id: comment.id });
});

/** GET `<apiRoot>`/comments/:commentId
 *
 * Get a single comment. An error is thrown if the comment doesn't
 * exist.
 *
 * URL params: commentId
 *
 * Return: {
 *    "id": `<comment id>`,
 *    "authorId": `<comment author id>`,
 *    "content": `<comment content>`
 * }
 *
 * Success status code: 200
 */
const getComment = asyncHandler(async (req, res) => {
  let comment = await Comment.findById(req.params.commentId, {
    attributes: ["id", "authorId", "content", "createdAt"],
  });

  if (!comment) {
    throw new ResourceNotFoundError(
      `Comment with id ${req.params.commentId} does not exist
      }`
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
 * Return: {
 *    "id": `<comment id>`,
 *    "authorId": `<comment author id>`,
 *    "content": `<comment content>`
 * }
 *
 * Success status code: 204
 */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.destroy({
    where: {
      id: req.params.commentId,
      authorId: req.user.id,
    },
  });

  if (!comment) {
    throw new ResourceNotFoundError(
      `Comment with id ${req.params.commentId} does not exist for user ${
        req.user.id || "anonymous"
      }`
    );
  }

  res.status(StatusCodes.NO_CONTENT).json(null);
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
 * DEV NOTES: Error if comment doesn't exist?
 */
const likeComment = asyncHandler(async (req, res) => {
  await Like.create({
    commentId: req.params.articleId, // INDEX ----------------------------------------------
    userId: req.user.id,
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
  const nDeletedRows = await Like.destroy({
    where: {
      commentId: req.params.commentId, // ----------------------------------- INDEX.
      authorId: req.user.id,
    },
  });

  // Infer comment/like existence from the number of deleted rows.
  if (!nDeletedRows) {
    ```Comment with id ${req.params.commentId} does not exist or user
      '${req.user.id}' hasn't liked it
      ```;
  }

  res.status(StatusCodes.NO_CONTENT).json(null);
});

export {
  getCommentComments,
  createCommentComment,
  getComment,
  deleteComment,
  likeComment,
  unlikeComment,
};
