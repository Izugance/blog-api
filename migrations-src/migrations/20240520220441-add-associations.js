"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Articles", "authorId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    await queryInterface.addIndex("Articles", {
      name: "articles_author_index",
      using: "HASH",
      fields: ["authorId"],
    });

    await queryInterface.addColumn("Comments", "authorId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    await queryInterface.addIndex("Comments", {
      name: "comments_author_index",
      using: "HASH",
      fields: ["authorId"],
    });

    await queryInterface.addColumn("Comments", "articleId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Articles",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    await queryInterface.addIndex("Comments", {
      name: "comments_article_index",
      using: "HASH",
      fields: ["articleId"],
    });

    await queryInterface.addColumn("Comments", "parentCommentId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Comments",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    await queryInterface.addIndex("Comments", {
      name: "comments_parent_comment_index",
      using: "HASH",
      fields: ["parentCommentId"],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Articles", "authorId");
    await queryInterface.removeIndex("Articles", "articles_author_index");
    await queryInterface.removeColumn("Comments", "authorId");
    await queryInterface.removeIndex("Comments", "comments_author_index");
    await queryInterface.removeColumn("Comments", "articleId");
    await queryInterface.removeIndex("Comments", "comments_article_index");
    await queryInterface.removeColumn("Comments", "parentCommentId");
    await queryInterface.removeIndex(
      "Comments",
      "comments_parent_comment_index"
    );
  },
};
