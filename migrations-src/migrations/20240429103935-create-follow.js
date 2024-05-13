const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("Follows", {
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
  await queryInterface.dropTable("Follows");
};

export { up, down };
