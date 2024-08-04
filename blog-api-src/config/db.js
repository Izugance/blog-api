import "dotenv/config";
import { Sequelize } from "sequelize";

const connectDB = (options) => {
  try {
    const sequelize = new Sequelize(process.env.DB_URI, {
      logging: false, // Don't log queries.
    });
    if (options && options.verbose) {
      console.log("Connected to the database");
    }
    return sequelize;
  } catch (err) {
    throw new Error("Could not connect to the database\n" + err.message);
  }
};

export { connectDB };
