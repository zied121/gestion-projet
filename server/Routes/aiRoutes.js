// const express = require('express');
// const router = express.Router();
// const isAuth = require('../Middleware/isauth');
// const { summarizeWithCohere } = require('../Controllers/aiController');
//
// router.post('/ai/summarize', isAuth, summarizeWithCohere);
//
//
//
// module.exports = router;
const express = require('express');
const router = express.Router();
const { suggestTasks } = require('../controllers/aiController');
const isAuth = require('../Middleware/isauth');

router.post('/ai/suggest-tasks', isAuth, suggestTasks);

module.exports = router;
