"use strict";

const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("likes", {
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
  await queryInterface.dropTable("likes");
};

export { up, down };
