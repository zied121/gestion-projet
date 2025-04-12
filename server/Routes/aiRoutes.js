const express = require('express');
const router = express.Router();
const isAuth = require('../Middleware/isauth');
const { suggestTaskTitleHF } = require('../Controllers/aiController');

router.post('/ai/suggest-title-hf', isAuth, suggestTaskTitleHF);


module.exports = router;
