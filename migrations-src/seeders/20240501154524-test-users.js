"use strict";

const up = async (queryInterface, Sequelize) => {
  let users = [];
  for (let i = 1; i <= 3; i++) {
    users.push({
      firstName: "Test" + i,
      lastName: "User" + i,
      email: "test" + i + "@test.com",
      username: "test" + i,
      password: "test",
    });
  }
  await queryInterface.bulkInsert("Users", users);
};

const down = async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete("Users", null);
};
