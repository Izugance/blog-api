// One-to-many association with User.
const initArticle = (sequelize, DataTypes) => {
  const Article = sequelize.define(
    "Article",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 100], // Reasonable?
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 10000],
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
      // Options.
      // TODO: Add index on userId col.
    }
  );

  // onDelete/onUpdate duplicated on source and target models just for
  // clarity.
  //
  // Suppose you want to store a fkey name of "sourceId". You need to
  // duplicate the fkey name on the source and target models, else you
  // have both "SourceId" (default, from the model without the
  // explicitly named fkey) and "sourceId" (from the model with the
  // explicitly named fkey) db fields.
  Article.associate = function (models) {
    Article.belongsTo(models.User, {
      as: "Author",
      foreignKey: {
        name: "authorId",
        allowNull: true,
      },
      onDelete: "SET NULL",
    });
    Article.hasMany(models.Comment, {
      foreignKey: {
        name: "articleId",
        allowNull: true,
      },
      constraints: false, // Resolves circularity.
      onDelete: "SET NULL",
    });
    Article.hasMany(models.Like, {
      foreignKey: {
        name: "articleId",
        allowNull: true,
      },
      constraints: false, // Resolves circularity.
      onDelete: "CASCADE",
    });
    return Article;
  };

  return Article;
};

export { initArticle };
