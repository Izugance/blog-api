import express from "express";
import "dotenv/config";
import asyncHandler from "express-async-handler";
import { createServer } from "node:http";
import { StatusCodes } from "http-status-codes";

import { sequelize, models } from "./models/index.js";
import errorHandler from "./middleware/fooErrorHandler.js";

const app = express();
app.use(express.json());

// -----Routes-----
const initRoutes = async () => {
  const { authRouter, userRouter, articleRouter, commentRouter } = await import(
    "./routes/index.js"
  );

  const apiRoot = "/api/v1";
  app.use(apiRoot + "/auth", authRouter);
  app.use(apiRoot + "/users", userRouter);
  app.use(apiRoot + "/articles", articleRouter);
  app.use(apiRoot + "/comments", commentRouter);
  app.get(
    apiRoot + "/",
    asyncHandler(async (req, res) => {
      res.status(StatusCodes.OK).send("Welcome to the Blog API");
    })
  );
  app.use(errorHandler);
};

// -----Middleware-----
const initMiddleware = () => {
  // app.use(errorHandler);
};

// -----Server-setup-----
const port = process.env.PORT || 3000;
const server = createServer(app);

const serve = async () => {
  try {
    await sequelize.sync({ force: true, logging: false });
    // await sequelize.sync({ logging: false });
    console.log("Models synchronized");
    await initRoutes();
    initMiddleware();
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
    // Seed users.
    let users = [];
    for (let i = 1; i <= 3; i++) {
      users.push({
        id: i,
        email: "test" + i + "@test.com",
        username: "test" + i,
        firstName: "Test",
        lastName: "User",
        password: "test",
      });
    }
    await models.User.bulkCreate(users, { individualHooks: true });
  } catch (err) {
    throw new Error("Could not start-up server\n" + `Reason: ${err.message}`);
  }
};
serve();
