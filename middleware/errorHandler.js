"use strict";

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(`Unhandled error on ${ctx.method} ${ctx.path}:`, err);
    ctx.status = err.status || 500;
    ctx.body = { message: "An unexpected error occurred" };
  }
};
