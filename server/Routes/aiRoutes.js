const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');
const { summarizeWithCohere } = require('../Controllers/aiController');

router.post('/ai/summarize', isAuth, summarizeWithCohere);



module.exports = router;
