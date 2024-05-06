import jwt from "jsonwebtoken";
import "dotenv/config";
import bcrypt from "bcrypt";
import { Model } from "sequelize";

import { toTitleCase } from "../utils/toTitleCase.js";

// 1:M association with: Like, Article, Comment, User (following & followers).
class User extends Model {
  genJWT() {
    return jwt.sign(
      { userId: this.id, email: this.email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );
  }
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }
}

const initUser = (sequelize, DataTypes) => {
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: true,
          isLowercase: true, // Reasonable?
        },
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isLowercase: true,
          is: /^(?!\.)(\.?(?!\.)_*\.?(?!\.))*\d*[a-zA-Z]+\d*((\.?(?!\.)_*\.?(?!\.))*\w*)*\w+$/,
          notEmpty: true,
          len: [1, 20],
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isAlpha: true,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isAlpha: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      fullName: {
        type: DataTypes.VIRTUAL,
        get() {
          return toTitleCase(`${this.firstName} ${this.lastName}`);
        },
      },
    },
    {
      sequelize,
      hooks: {
        beforeSave: async (user, options) => {
          const salt = await bcrypt.genSalt();
          user.password = await bcrypt.hash(user.password, salt);
        },
      },
    }
  );

  User.associate = function (models) {
    User.hasMany(models.Article, {
      foreignKey: {
        name: "authorId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });
    User.hasMany(models.Comment, {
      foreignKey: {
        name: "authorId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });
    User.hasMany(models.Like, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });
    // The follow relation. Source is taken as the followed user.
    // Target is taken as the following user.
    //
    // Self-referencing -> we don't need the full sequelize association
    // pair. `constraints: false` resolves circularity.
    User.belongsToMany(User, {
      through: "Follow",
      as: {
        singular: "Follow",
        plural: "Follows",
      },
      foreignKey: {
        name: "followingUserId",
        allowNull: false,
      },
      otherKey: {
        name: "followedUserId",
        allowNull: false,
      },
      onDelete: "CASCADE", // Sequelize default.
      timestamps: true,
      constraints: false,
    });
    return User;
  };

  return User;
};

export { initUser };
