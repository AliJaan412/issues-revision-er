'use strict';

const Router = require('koa-router');
const router = new Router();
const issues = require('./api/issues');
const auth = require('./api/auth');

router.get('/', require('./api/discovery'));
router.get('/health', require('./api/health'));
router.get('/issues', issues.list);
router.get('/issues/:id', issues.get);
router.post('/issues', issues.create);
router.put('/issues/:id', issues.update);
router.get('/issues/:id/revisions', issues.revisions);
router.get('/issues/:id/revisions/compare/:revisionA/:revisionB', issues.compareRevisions);
router.use('/auth', auth.routes());


module.exports = router;
