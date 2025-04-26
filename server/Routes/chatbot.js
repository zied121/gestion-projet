const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');
const { processQuery } = require('../Controllers/chatbotController');

router.use(isAuth);
router.post('/chat', processQuery);

module.exports = router;