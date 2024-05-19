// 1:M association with: User, Like.
// M:1 association with: Comment, Article.
import { DataTypes } from "sequelize";
const initComment = (sequelize) => {
  const Comment = sequelize.define(
    "Comment",
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 5000], // Good limit?
        },
      },
      nLikes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      nComments: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
    },
    {
      validate: {
        /** Checks that a Comment is associated with one comment OR one article. */
        hasOneParentPost() {
          let bothNull = !this.articleId && !this.parentCommentId;
          let bothNotNull = !!this.articleId && !!this.parentCommentId;
          if (bothNotNull || bothNull) {
            throw new Error(
              "A comment must be associated with a comment or an article, but not both"
            );
          }
        },
      },
    }
  );

  Comment.associate = function (models) {
    // Self-referencing -> we don't need the full sequelize association
    // pair.
    Comment.hasMany(models.Comment, {
      foreignKey: {
        name: "parentCommentId",
        allowNull: true,
      },
      constraints: false, // Resolves circularity.
      // DON'T CASCADE COMMENT DELETES TO COMMENTS?                              -----------
    });
    Comment.hasMany(models.Like, {
      foreignKey: {
        name: "commentId",
        allowNull: true,
      },
      constraints: false, // Resolves circularity.
      onDelete: "CASCADE",
    });
    Comment.belongsTo(models.User, {
      as: "Author",
      foreignKey: {
        name: "authorId",
        allowNull: false,
      },
    });
    Comment.belongsTo(models.Article, {
      foreignKey: {
        name: "articleId",
        allowNull: true, // Check model-wide validation above.
      },
      // DON'T CASCADE ARTICLE DELETES TO COMMENTS?                              -----------
    });
    return Comment;
  };

  return Comment;
};

export { initComment };
