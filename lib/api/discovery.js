'use strict';

const respond = require('./responses');

module.exports = (context) => {
  respond.success(context, {
    discovery: `${context.protocol}://${context.host}`
  });
};
