"use strict";
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const config = require("./config");
const router = require("./lib/routes");
const authRouter = require("./lib/api/auth");
const authMiddleware = require("./middleware/auth");
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
  });
