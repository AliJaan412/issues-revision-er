'use strict';

require('dotenv').config();

// Used by sequelize-cli (npm run migrate / migrate:undo). Reads the same
// environment variables as the running app (see lib/db/connection.js) so
// migrations always target the database the app actually connects to.
const shared = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
};

module.exports = {
  development: shared,
  test: shared,
  production: shared,
};
