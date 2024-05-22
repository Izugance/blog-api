import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

import { models, sequelize } from "../models/index.js";
import { getOffset } from "../utils/pagination.js";
import { ResourceNotFoundError } from "../errors/resource-not-found.js";

const User = models.User;
const Follow = models.Follow;
const Like = models.Like;
const Article = models.Article;
const Comment = models.Comment;
const PAGINATION_LIMIT = 16;

/** GET `<apiRoot>`/users/current-user/profile
 *
 * Get the logged-in user's profile.
 *
 * Return: {
 *    "id": `<user id>`,
 *    "username": `<user username>`,
 *    "firstName": `<user first name>`,
 *    "lastName": `<user last name>`,
 *    "nArticles": `<user article count>`,
 *    "nComments": `<user comment count>`,
 *    "nLikes": `<user like count>`,
 *    "nFollowers": `<user follower count>`,
 *    "nFollowing": `<user following count>`,
 *    "createdAt": `<user creation datetime>`
 * }
 *
 * Success status code: 200
 *
 * DEV NOTES: Select fields in return.
 */
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: [
      "id",
      "username",
      "firstName",
      "lastName",
      "nArticles",
      "nComments",
      "nLikes",
      "nFollowers",
      "nFollowing",
      "createdAt",
    ],
  });
  res.status(StatusCodes.OK).json({ user });
});

/** GET `<apiRoot>`/users/:username
 *
 * Get a user by username.
 *
 * URL params: username
 *
 * Return: {
 *    "id": `<user id>`,
 *    "username": `<user username>`,
 *    "firstName": `<user first name>`,
 *    "lastName": `<user last name>`,
 *    "nArticles": `<user article count>`,
 *    "nFollowers": `<user follower count>`,
 *    "nFollowing": `<user following count>`,
 *    "createdAt": `<user creation datetime>`
 * }
 *
 * Success status code: 200
 *
 * DEV NOTES: Select fields in return.
 */
const getUserByUsername = asyncHandler(async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const user = await User.findOne({
    where: { username },
    attributes: [
      "id",
      "username",
      "firstName",
      "lastName",
      "nArticles",
      "nFollowers",
      "nFollowing",
      "createdAt",
    ],
  });
  if (!user) {
    throw new ResourceNotFoundError(
      `User with username '${req.params.username}' does not exist`
    );
  }
  res.status(StatusCodes.OK).json({ user });
});

/** GET `<apiRoot>`/users/:username/articles
 *
 * Get articles belonging to a user using their username.
 *
 * URL params: username
 *
 * Return: [
 *    {
 *      "id": `<article id>`,
 *      "title": `<article title>`,
 *      "createdAt": `<article creation datetime>`
 *    },
 *    ...
 * ]
 *
 * Successs status code: 200
 *
 * DEV NOTES: Include content in return?
 */
const getUserArticles = asyncHandler(async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const user = await User.findOne(
    { where: { username } },
    { attributes: ["id"] }
  );
  if (!user) {
    throw new ResourceNotFoundError(
      `User with username '${req.params.userId}' does not exist`
    );
  }
  const page = Number(req.query.page) || 1;
  const offset = getOffset(PAGINATION_LIMIT, page);
  let articles = await user.getArticles({
    offset,
    limit: PAGINATION_LIMIT,
    attributes: ["id", "title", "createdAt"],
  });
  articles = articles.map((article) => {
    return article.toJSON();
  });
  res.status(StatusCodes.OK).json({ articles });
});

/** GET `<apiRoot>`/users/current-user/likes
 * Get the current logged-in user's likes. A `postType` key is included
 * to indicate if the returned like is for an Article or a Comment.
 *
 * URL params: userId
 *
 * Return: [
 *    {
 *      "createdAt": `<like creation datetime>`,
 *      "postType": "article",
 *      "Comment": {
 *          "id":   <article id>`,
 *          "createdAt": `<article creation datetime`,
 *          "title": `<article title>`,
 *          "Author": {
 *              "id": `<author id>`,
 *              "username": `<author username>`
 *          }
 *      }
 *    },
 *    {
 *      "createdAt": `<comment id>`,
 *      "postType": `<comment>`,
 *      "Comment": {
 *          "id": `<comment id>`,
 *          "createdAt": `<comment creation datetime>`
 *          "Author": {
 *              "id": `<author id>`,
 *              "username": `<author username>`
 *          }
 *      }
 *    },
 *    ...
 * ]
 *
 * Success status code: 200
 *
 * DEV NOTES: Do return fields make sense? Include count? Order by
 * date.
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
    order: [["createdAt", "DESC"]], // Should this be "ASC"?
    attributes: ["createdAt"],
    include: [
      {
        model: Article,
        attributes: ["id", "createdAt", "title"],
        include: {
          model: User,
          as: "Author",
          attributes: ["id", "username"],
        },
      },
      {
        model: Comment,
        attributes: ["id", "content", "createdAt"],
        include: {
          model: User,
          as: "Author",
          attributes: ["id", "username"],
        },
      },
    ],
  });
  likes = likes.map((like) => {
    if (!like.Comment) {
      return { createdAt: like.createdAt, Article: like.Article };
    } else {
      return { createdAt: like.createdAt, Comment: like.Comment };
    }
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
  const user = await User.findByPk(req.params.userId, { attributes: ["id"] });
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
  const user = await User.findByPk(req.params.userId, { attributes: ["id"] });
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
  const targetUser = await User.findByPk(req.params.userId, {
    attributes: ["id"],
  });
  if (!targetUser) {
    throw new ResourceNotFoundError(
      `User with id '${req.params.userId}' does not exist`
    );
  }
  await sequelize.transaction(async (t) => {
    await Follow.create({
      followingUserId: req.user.id,
      followedUserId: targetUser.id,
    });
    await User.increment(
      "nFollowers",
      {
        where: { id: targetUser.id },
        by: 1,
        returning: false,
      },
      { transaction: t }
    );
    await User.increment(
      "nFollowing",
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
  const targetUser = await User.findByPk(req.params.userId, {
    attributes: ["id"],
  });
  if (!targetUser) {
    throw new ResourceNotFoundError(
      `User with id '${req.params.userId}' does not exist`
    );
  }
  await sequelize.transaction(async (t) => {
    // INFER FOLLOWER EXISTENCE? --------------------------------------------------------
    await Follow.destroy({
      where: {
        followingUserId: req.user.id,
        followedUserId: targetUser.id,
      },
    });
    await User.decrement(
      "nFollowers",
      {
        where: { id: targetUser.id },
        by: 1,
        returning: false,
      },
      { transaction: t }
    );
    await User.decrement(
      "nFollowing",
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
  getCurrentUserProfile,
  getUserByUsername,
  getUserArticles,
  getUserFollowing,
  getUserFollowers,
  getUserLikes,
  followUser,
  unfollowUser,
};
