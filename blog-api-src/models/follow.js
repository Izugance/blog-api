"use strict";

const initFollow = (sequelize, DataTypes) => {
  const Follow = sequelize.define(
    "Follow",
    {},
    {
      validate: {
        /** Checks that the following user and the followed user don't
         * match.
         */
        noSelfFollowing() {
          if (this.followingUserId == this.followedUserId) {
            throw new Error(
              "`followingUserId` must not match `followedUserId`"
            );
          }
        },
      },
      // Hash indexes are used below since we don't anticipate range
      // queries on these fields.
      indexes: [
        {
          name: "follows_following_user_index",
          using: "HASH",
          fields: ["followingUserId"],
        },
        {
          name: "follows_followed_user_index",
          using: "HASH",
          fields: ["followedUserId"],
        },
      ],
    }
  );

  Follow.associate = function (models) {
    Follow.belongsTo(models.User, {
      foreignKey: {
        name: "followingUserId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });
    Follow.belongsTo(models.User, {
      foreignKey: {
        name: "followedUserId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });
    return Follow;
  };

  return Follow;
};

export { initFollow };
