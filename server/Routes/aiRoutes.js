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
const { generateTitleOrDescription ,chatWithPromptHandler} = require('../controllers/aiController');
const isAuth = require('../Middleware/isauth');

router.post('/generate-title-desc', isAuth, generateTitleOrDescription);
router.post('/ai/chat', isAuth, chatWithPromptHandler);
module.exports = router;
