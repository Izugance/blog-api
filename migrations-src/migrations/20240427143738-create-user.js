"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nLikes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      nArticles: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      nComments: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      nFollowers: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      nFollowing: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex("Users", {
      name: "users_email_index",
      unique: true,
      fields: ["email"],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
