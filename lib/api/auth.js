const Router = require('@koa/router');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = new Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_SALT_ROUNDS = 10;
// Used to run bcrypt.compare against a non-existent user so response timing
// doesn't reveal whether an email is registered.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('not-a-real-password', PASSWORD_SALT_ROUNDS);

function validateCredentials(email, password) {
  const errors = [];
  if (!email || typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
    errors.push('A valid email is required');
  }
  if (!password || typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  return errors;
}

// POST /signup
router.post('/signup', async (ctx) => {
  const { email, password } = ctx.request.body || {};

  const errors = validateCredentials(email, password);
  if (errors.length) {
    ctx.status = 400;
    ctx.body = { errors };
    return;
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    ctx.status = 400;
    ctx.body = { error: 'Email already in use' };
    return;
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  const user = await User.create({ email, password: passwordHash });

  ctx.status = 201;
  ctx.body = { message: 'User created', userId: user.id };
});

// POST /login
router.post('/login', async (ctx) => {
  const { email, password } = ctx.request.body || {};

  if (!email || !password) {
    ctx.status = 400;
    ctx.body = { error: 'Email and password are required' };
    return;
  }

  const user = await User.findOne({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_PASSWORD_HASH);

  if (!user || !passwordMatches) {
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
