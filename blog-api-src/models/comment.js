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
        /** Checks that a Comment is associated with one comment OR one article
         * OR none (in the case of a deleted parent article/comment).
         */
        hasAtMostOneParent() {
          let bothNotNull = !!this.articleId && !!this.parentCommentId;
          if (bothNotNull) {
            throw new Error(
              `A comment must be associated with a comment or an article or none (in
              the case of a deleted parent article/comment), but not both a comment
              and an article`
            );
          }
        },
      },
      // TODO: Index userId, commentId, articleId.
      indexes: [
        {
          name: "comments_author_index",
          using: "HASH",
          fields: ["authorId"],
        },
        {
          name: "comments_article_index",
          using: "HASH",
          fields: ["articleId"],
        },
        {
          name: "comments_parent_comment_index",
          using: "HASH",
          fields: ["parentCommentId"],
        },
      ],
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
      constraints: true, // Resolves circularity.
      // DON'T CASCADE COMMENT DELETES TO COMMENTS?                              -----------
      onDelete: "SET NULL",
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
      onDelete: "CASCADE",
    });

    Comment.belongsTo(models.Article, {
      foreignKey: {
        name: "articleId",
        allowNull: true, // Check model-wide validation above.
      },
      // DON'T CASCADE ARTICLE DELETES TO COMMENTS?                              -----------
      onDelete: "SET NULL",
    });

    return Comment;
  };

  return Comment;
};

export { initComment };
