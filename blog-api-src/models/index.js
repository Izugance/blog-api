import { DataTypes } from "sequelize";

import { connectDB } from "../config/db.js";
import { initUser } from "./user.js";
import { initArticle } from "./article.js";
import { initComment } from "./comment.js";
import { initLike } from "./like.js";
import { initFollow } from "./follow.js";

const sequelize = connectDB({ verbose: true });
// `initFollow` is placed before `initUser` as the `Follow` model is
// join table used by the `User` model for follow M2M relations.
const modelInits = [initFollow, initUser, initArticle, initComment, initLike];
// const modelInits = [initUser, initArticle, initComment, initLike, initFollow];
const models = {};
// Initialize models.
modelInits.forEach((init) => {
  const model = init(sequelize, DataTypes);
  models[model.name] = model;
});
// Associate models.
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize, models };
