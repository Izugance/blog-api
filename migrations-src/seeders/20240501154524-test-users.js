"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    let users = [];
    for (let i = 1; i <= 3; i++) {
      users.push({
        firstName: "Test" + i,
        lastName: "User" + i,
        email: "test" + i + "@test.com",
        username: "test" + i,
        password: "test",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await queryInterface.bulkInsert("Users", users);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null);
  },
};
