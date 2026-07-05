"use strict";
require("dotenv").config();

const REQUIRED_ENV_VARS = [
  "PORT",
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "DB_PORT",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
];

const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
if (missingEnvVars.length) {
  console.error(
    `❌ Missing required environment variable(s): ${missingEnvVars.join(", ")}. See .env.example.`
  );
  process.exit(1);
}

const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const config = require("./config");
const router = require("./lib/routes");
const authRouter = require("./lib/api/auth");
const authMiddleware = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");
const sequelize = require("./lib/db/connection");
require("./lib/models/issue");
require("./lib/models/user");
require("./lib/models/revision");
const setupAssociations = require("./lib/models/associations");
sequelize
  .authenticate()
  .then(async () => {
    setupAssociations(sequelize);
    await sequelize.sync();
    const app = new Koa();

    app.use(errorHandler);
    app.use(bodyParser());
    app.use(authRouter.routes());
    app.use(authRouter.allowedMethods());
    app.use(authMiddleware);
    app.use(router.routes());
    app.use(router.allowedMethods());

    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
    });
    console.log("✅ DB connection established.");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to the database:", err);
    process.exit(1);
  });
