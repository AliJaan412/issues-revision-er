const Router = require('@koa/router');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');

const router = new Router();


// POST /signup
router.post('/signup', async (ctx) => {
  const { email, password } = ctx.request.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    ctx.status = 400;
    ctx.body = { error: 'Email already in use' };
    return;
  }

  const user = await User.create({ email, password });

  ctx.status = 201;
  ctx.body = { message: 'User created', userId: user.id };
});

// POST /login
router.post('/login', async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await User.findOne({ where: { email } });

  if (!user || user.password !== password) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid email or password' };
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  ctx.body = { token };
});

module.exports = router;
