"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    let users = [];
    const salt = await bcrypt.genSalt();
    for (let i = 1; i <= 3; i++) {
      users.push({
        firstName: "Test",
        lastName: "User",
        email: "test" + i + "@test.com",
        username: "test" + i,
        password: await bcrypt.hash("test", salt),
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
