const jwt = require('jsonwebtoken');

module.exports = async (ctx, next) => {
  // Excluding health, login, signup and discovery endpoints
  if (['/health', '/', '/auth/login','/auth/signup'].includes(ctx.path)) {
    return next();
  }

  // Checking for X-Client-ID header
  const clientId = ctx.headers['x-client-id'];
  if (!clientId) {
    ctx.status = 400;
    ctx.body = { error: 'X-Client-ID header is required' };
    return;
  }

  // Checking for Authorization header
  const authHeader = ctx.headers['authorization'];
  if (!authHeader) {
    ctx.status = 401;
    ctx.body = { error: 'Access denied. No token provided.' };
    return;
  }

  const token = authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ctx.state.user = decoded;
  } catch (err) {
    ctx.status = 403;
    ctx.body = { error: 'Invalid or expired token' };
    return;
  }
  
  await next();
  
};
