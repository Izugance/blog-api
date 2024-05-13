"use strict";

const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("comments", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    foo: {
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
};

const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("comments");
};

export { up, down };
