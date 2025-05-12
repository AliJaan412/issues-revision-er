"use strict";

module.exports = {
  success: (context, data) => {
    context.body = data;
    context.status = data ? 200 : 204;
  },
  badRequest: (context, errors) => {
    context.body = {
      message: "Check your request parameters",
      errors: errors,
    };
    context.status = 400;
  },
  notFound: (context) => {
    context.body = { messsage: "Resource was not found" };
    context.status = 404;
  },
  error: (context, message, statusCode = 500) => {
    context.body = {
      message: message || "An unexpected error occurred",
    };
    context.status = statusCode;
  },
};
