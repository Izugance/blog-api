// One-to-many association with likes.
const initLike = (sequelize, DataTypes) => {
  const Like = sequelize.define(
    "Like",
    {},
    {
      validate: {
        /** Checks that a Like is associated with one comment OR one article. */
        hasOnePost() {
          let bothNull = this.articleId == null && this.commentId == null;
          let bothNotNull = this.articleId !== null && this.commentId !== null;
          if (bothNotNull || bothNull) {
            throw new Error(
              "A like must be associated with a comment or an article, but not both"
            );
          }
        },
      },
    }
  );

  Like.associate = function (models) {
    Like.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
    });
    Like.belongsTo(models.Article, {
      foreignKey: {
        name: "articleId",
        allowNull: true, // Check model-wide validation above.
      },
      onDelete: "CASCADE",
    });
    Like.belongsTo(models.Comment, {
      foreignKey: {
        name: "commentId",
        allowNull: true, // Check model-wide validation above.
      },
    });
    return Like;
  };

  return Like;
};

export { initLike };
