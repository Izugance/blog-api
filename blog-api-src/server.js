import express from "express";
import "dotenv/config";
import asyncHandler from "express-async-handler";
import { createServer } from "node:http";
import { StatusCodes } from "http-status-codes";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import xssClean from "xss-clean";

// import { sequelize, models } from "./models/index.js";
import controllerErrorHandler from "./middleware/controller-error-handler.js";
import endpointNotFoundMiddleware from "./middleware/endpoint-not-found.js";

const app = express();

// -----Pre-route middleware-----
const initPreRouteMiddleware = () => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());
  app.use(helmet());
  app.use(xssClean());
};

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
};

// -----Post-route middleware-----
const initPostRouteMiddleware = () => {
  app.use(controllerErrorHandler);
  app.use(endpointNotFoundMiddleware);
};

// -----Server-setup-----
const port = process.env.PORT || 3000;
const server = createServer(app);

const serve = async () => {
  try {
    // await sequelize.sync({ force: true, logging: false });
    // await sequelize.sync({ logging: false });
    // console.log("Models synchronized");
    initPreRouteMiddleware();
    await initRoutes();
    initPostRouteMiddleware();
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
    // Seed users.
    // let users = [];
    // for (let i = 1; i <= 3; i++) {
    //   users.push({
    //     id: i,
    //     email: "test" + i + "@test.com",
    //     username: "test" + i,
    //     firstName: "Test",
    //     lastName: "User",
    //     password: "test",
    //   });
    // }
    // await models.User.bulkCreate(users, { individualHooks: true });
  } catch (err) {
    throw new Error("Could not start-up server\n" + `Reason: ${err.message}`);
  }
};
serve();
