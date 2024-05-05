import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

import { models } from "../models/index.js";
import { getOffset } from "../utils/pagination.js";
import { ResourceNotFoundError } from "../errors/resource-not-found.js";

const User = models.User;
const Follow = models.Follow;
const Like = models.Like;
const PAGINATION_LIMIT = 16;

/** GET `<apiRoot>`/users/:email
 *
 * Get a user by email.
 *
 * URL params: email
 *
 * Return: {
 *    "id": `<user id>`,
 *    "email": `<user email>`,
 *    "firstName": `<user first name>`,
 *    "lastName": `<user last name>`
 * }
 *
 * Success status code: 200
 *
 * DEV NOTES: Select fields in return. Change to `getUserByUsername`
 */
const getUserByEmail = asyncHandler(async (req, res) => {
  const email = req.params.email.trim().toLowerCase();
  const user = await User.findOne({
    where: { email },
    attributes: ["id", "username", "email", "firstName", "lastName"],
  });
  res.status(StatusCodes.OK).json({ user });
});

/** GET `<apiRoot>`/users/:userId/articles
 *
 * Get articles belonging to a user.
 *
 * URL params: userId
 *
 * Return: [
 *    {
 *      "id": `<article id>`,
 *      "title": `<article title>`
 *    },
 *    ...
 * ]
 *
 * Successs status code: 200
 *
 * DEV NOTES: Include content in return?
 */
const getUserArticles = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.userId);
  if (!user) {
    throw new ResourceNotFoundError(
      `User with id '${req.params.userId}' does not exist`
    );
  }
  const page = Number(req.query.page) || 1;
  const offset = getOffset(PAGINATION_LIMIT, page);
  let articles = await user.getArticles({
    offset,
    limit: PAGINATION_LIMIT,
    attributes: ["id", "authorId", "title", "createdAt"],
  });
  // articles = articles.map((article) => {
  //   return article.toJSON();
  // });
  articles = articles.toJSON();
  res.status(StatusCodes.OK).json({ articles });
});

/** GET `<apiRoot>`/users/current_user/likes
 * Get the current logged-in user's likes.                                   -------Reasonable?
 *
 * URL params: userId
 *
 * Return: [
 *    {
 *      "postId": `<post id>`,
 *      "postType": `<post type (comment or article)>`, // HOW TO IMPLEMENT? ---------------------------
 *    },
 *    ...
 * ]
 *
 * Success status code: 200
 *
 * DEV NOTES: Do return fields make sense? Include count?
 */
const getUserLikes = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const offset = getOffset(PAGINATION_LIMIT, page);
  let likes = await Like.findAll({
    where: {
      userId: req.user.id,
    },
    offset,
    limit: PAGINATION_LIMIT,
    attributes: ["articleId", "commentId"],
  });
  likes = likes.map((like) => {
    if (like.articleId) {
      return { postId: like.articleId, postType: "Article" };
    }
    return { postId: like.commentId, postType: "Comment" };
  });

  res.status(StatusCodes.OK).json({ likes });
});

/** GET `<apiRoot>`/users/:userId/following
 *
 * Get users followed by a user.
 *
 * URL params: userId
 *
 * Return: [
 *    {
 *      "createdAt": `<follow creation datetime>`,
 *      "User": {
 *        "id": `<userId>`,
 *        "username": `<user username>`,
 *        "firstName": `<user first name>`,
 *        "lastName": `<user last name>`
 *      },
 *    },
 *    ...
 * ]
 *
 * Success status code: 200
 *
 * DEV NOTES: Include other fields (e.g. email and count) in return?
 * Order? No need for user query due to fkey constraint on `Follow`?
 */
const getUserFollowing = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.userId);
  if (!user) {
    throw new ResourceNotFoundError(
      `User with id '${req.params.userId}' does not exist`
    );
  }
  const page = Number(req.query.page) || 1;
  const offset = getOffset(PAGINATION_LIMIT, page);
  let following = await Follow.findAll({
    where: {
      followingUserId: user.id,
    },
    offset,
    limit: PAGINATION_LIMIT,
    include: {
      model: User,
      attributes: ["id", "username", "firstName", "lastName"],
    },
    attributes: ["createdAt"],
  });
  following = following.map((userFollows) => {
    return userFollows.toJSON();
  });
  res.status(StatusCodes.OK).json({ following });
});

/** GET `<apiRoot>`/users/:userId/followers
 *
 * Get users following a user.
 *
 * URL params: userId
 *
 * Return: [
 *    {
 *      "createdAt": `<follow creation datetime>`,
 *      "User": {
 *        "id": `<userId>`,
 *        "username": `<user username>`,
 *        "firstName": `<user first name>`,
 *        "lastName": `<user last name>`
 *      },
 *    },
 *    ...
 * ]
 *
 * Success status code: 200
 *
 * DEV NOTES: Include other fields (e.g. email and count) in return?
 *
 */
const getUserFollowers = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.userId);
  if (!user) {
    throw new ResourceNotFoundError(
      `User with id '${req.params.userId}' does not exist`
    );
  }
  const page = Number(req.query.page) || 1;
  const offset = getOffset(PAGINATION_LIMIT, page);
  let followers = await Follow.findAll({
    where: {
      followedUserId: user.id,
    },
    offset,
    limit: PAGINATION_LIMIT,
    include: {
      model: User,
      attributes: ["id", "username", "firstName", "lastName"],
    },
    attributes: ["createdAt"],
  });
  followers = followers.map((follower) => {
    return follower.toJSON();
  });
  res.status(StatusCodes.OK).json({ followers });
});

/** POST `<apiRoot>`/users/:userId/followers
 *
 * Follow a user.
 *
 * URL params: userId
 *
 * Return: null
 *
 * Success status code: 200
 *
 * DEV NOTES: Error if user doesn't exist? Don't need extra query for
 * targetUser due to fkey in model?
 */
const followUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findByPk(req.params.userId);
  if (!targetUser) {
    throw new ResourceNotFoundError(
      `User with id '${req.params.userId}' does not exist`
    );
  }
  await Follow.create({
    followingUserId: req.user.id,
    followedUserId: targetUser.id,
  });
  res.status(StatusCodes.CREATED).json(null);
});

/** DELETE `<apiRoot>`/users/userId/followers
 *
 * Unfollow a user.
 *
 * URL params: userId
 *
 * Return: null
 *
 * Success status code: 204
 *
 * DEV NOTES: Error if user doesn't exist?
 */
const unfollowUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findByPk(req.params.userId);
  if (!targetUser) {
    throw new ResourceNotFoundError(
      `User with id '${req.params.userId}' does not exist`
    );
  }
  // INFER FOLLOWER EXISTENCE? --------------------------------------------------------
  await Follow.destroy({
    where: {
      followingUserId: req.user.id,
      followedUserId: targetUser.id,
    },
  });
  res.status(StatusCodes.NO_CONTENT).json(null);
});

export {
  getUserByEmail,
  getUserArticles,
  getUserFollowing,
  getUserFollowers,
  getUserLikes,
  followUser,
  unfollowUser,
};
