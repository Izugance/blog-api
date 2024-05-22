"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Likes", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      articleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Articles",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      commentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Comments",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("Likes", {
      name: "likes_article_index",
      using: "HASH",
      fields: ["articleId"],
    });
    await queryInterface.addIndex("Likes", {
      name: "likes_comment_index",
      using: "HASH",
      fields: ["commentId"],
    });
    await queryInterface.addIndex("Likes", {
      name: "likes_identity_index",
      unique: true,
      fields: ["userId", "articleId", "commentId"],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Likes");
  },
};
